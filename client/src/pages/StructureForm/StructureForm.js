/* ===== IMPORTS ===== */
import { useContext, useReducer, useState } from "react";
import { GameAddContext, MessageContext } from "../../utils/Contexts";
import FrontendHelper from "../../helper/FrontendHelper.js";
import Read from "../../database/read/Read.js";

const StructureForm = (setCategories) => {
    /* ===== CONTEXTS ===== */

    // keys object & unlock page function from game add context
    const { keys } = useContext(GameAddContext);

    // add message function from message context
    const { addMessage } = useContext(MessageContext);
    
    /* ===== STATES ===== */
    const [addCategory, setAddCategory] = useState(false);

    /* ===== VARIABLES ===== */
    const defaultVals = {
        category: [],
        mode: [],
        level: []
    };
    const formInit = {
        values: defaultVals,
        error: {
            category: undefined,
            mode: undefined,
            level: undefined
        }
    };
    const structureKey = keys.structure;

    /* ===== FUNCTIONS ===== */

    // database functions
    const { queryAll } = Read();

    // helper functions
    const { capitalize } = FrontendHelper();

    // FUNCTION 1: updateLocal - function that runs each time the user finishes interacting with a form field
    // PRECONDITIONS (1 parameter):
    // 1.) formData (optional): optional parameter. typically, we just use `form.values`, but we can also manually pass in data
    // POSTCONDITIONS (1 possible outcome):
    // the form data stored locally is updated with the current state of `form.values`
    const updateLocal = (formData = null) => {
        localStorage.setItem(structureKey, JSON.stringify(formData ?? form.values));
    };

    // FUNCTION 2: findChildren - function that takes an entityName & entityValue, and finds all "children" elements
    // PRECONDITIONS (3 parameters):
    // 1.) formValues - an object which contains keys that point to arrays of form data
    // 2.) entityName - a string representing the name of the entity we are dealing with
    // 3.) entityValue - a string representing the name of the value we want to find children of
    // POSTCONDITIONS (1 possible outcome):
    // an object is returned containing all related children, if any
    const findChildren = (formValues, entityName, entityValue) => {
        let children = { mode: [], level: [] };
        if (entityName === "category") {
            children.mode = formValues.mode.filter(mode => mode.category === entityValue);
        }

        if (["category", "mode"].includes(entityName)) {
            children.level = formValues.level.filter(level => level[entityName] === entityValue);
        }

        return children;
    };

    // FUNCTION 3: insertCategory - function that executes when the user performs an action to insert a category
    // PRECONDITIONS (2 parameters):
    // 1.) state: the current state of the form
    // 2.) data: the user inputted-category (object with two keys: id (int) and category (string))
    // POSTCONDITIONS (1 possible outcomes):
    // the category is added to the form
    const insertCategory = (state, data) => {
        const updatedValues = {
            ...state.values,
            category: [...state.values.category, data]
        }
        
        updateLocal(updatedValues);
        return { ...state, values: updatedValues };
    };

    // FUNCTION 4: updateCategory - function that executes when the user performs an action to update a category
    // PRECONDITIONS (2 parameters):
    // 1.) state: the current state of the form
    // 2.) data: the user inputted-category (object with two keys: id (int) and category (string))
    // POSTCONDITIONS (3 possible outcomes):
    // if the user attempts to update a category with a non-empty value, the function will do so
    // if the user attempts to update a category with an empty value, and the user hits "Yes", the category, and all
    // children elements (modes and levels), will be removed from the form
    // if the user attempts to update a category with an empty value, and the user hits "No", this function simply returns
    // the state, such that no changes are made to the form
    const updateCategory = (state, data) => {
        const stateValues = state.values;
        const updated = {
            ...state.values,
            category: stateValues.category.filter(v => v.id !== data.id)
        };

        // only re-introduce data if category is defined. otherwise, this function behaves as a "delete"
        if (!data.category) {
            const categoryName = stateValues.category.find(c => c.id === data.id).category;
            const children = findChildren(stateValues, "category", categoryName);
            let warning = "Deleting this category will also delete it's ";
            warning += children.level.length > 0 ? "modes & levels." : "modes.";
            warning += " Are you sure you want to do this?";

            // special case: warn the users if there exist any children of the category. if they decide *not*
            // to delete the category, this function does nothing
            if (children.mode.length > 0 && !window.confirm(warning)) {
                return state;
            }

            // otherwise, we need to go ahead and remove all children as well
            updated.level = updated.level.filter(level => level.category !== categoryName);
            updated.mode = updated.mode.filter(mode => mode.category !== categoryName);
        } else {
            updated.category.push(data);
        }

        updateLocal(updated);
        return { ...state, values: updated };
    };

    // FUNCTION 5: changeModes - function that executes when the user performs a 'change' on a mode
    // PRECONDITIONS (2 parameters):
    // 1.) state: the current state of the form
    // 2.) data: the user inputted-category (object with two keys: id (int) and category (string))
    // POSTCONDITIONS (2 possible outcomes):
    // if we are able to find that the mode already exists in the form, and the value is defined, treat as update
    // if we are able to find that the mode already exists in the form, and the value is empty, treat as delete
    // otherwise, treat as an insert
    const changeModes = (state, data) => {
        const matchingModeCondition = mode => mode.id === data.id && mode.category === data.category;
        let updatedModes = [...state.values.mode];
        const targetIndex = updatedModes.findIndex(mode => matchingModeCondition(mode));

        // if we fail to find mode, we need to treat as insert, and update any ids >= data.id
        if (targetIndex === -1) {
            for (let mode of updatedModes) {
                if (mode.id >= data.id) {
                    mode.id++;
                }
            }

            updatedModes.push(data);
            updatedModes.sort((a, b) => a.id - b.id);
        } else {
            // now, if the value is defined, treat as updated. otherwise, treat as delete
            if (data.name !== "") {
                updatedModes[targetIndex] = data;
            } else {
                updatedModes = updatedModes.filter(mode => !matchingModeCondition(mode));
            }
        }

        const updatedValues = { ...state.values, mode: updatedModes };
        updateLocal(updatedValues);
        return { ...state, values: updatedValues };
    };

    // FUNCTION 6: reducer - function that executes each time the user attempts to update the form reducer hook
    // PRECONDITIONS (2 parameters):
    // 1.) state: the state of the form object when the function is called
    // 2.) action: an object with three fields:
        // a.) field: specifies which field of the form the reducer should modify
        // b.) data: specifies the new value that the reducer should use to modify form[field]
        // c.) name: specifies the name of the entity we are currently interacting with
    // POSTCONDITIONS (5 possible outcomes):
    // if the type field is `insertCategory`, we add new value to the `name` array, and update our values object
    // if the type is `updateCategory`, we update the value already current to the `name` array, and update our values object
    // if the type is `values`, we simply update the values object using data
    // if the type is `error`, we simply update the error object using data
    // otherwise, this function does nothing 
    const reducer = (state, action) => {
        const { type, data } = action;

		switch (type) {
            case "insertCategory":
                return insertCategory(state, data);
            case "updateCategory":
                return updateCategory(state, data);
            case "modesChange":
                return changeModes(state, data);
            case "values":
                return { ...state, values: { ...state.values, ...data } };
			case "error":
                return { ...state, error: { ...state.error, ...data } };
			default:
				return null;
		};
    };

    /* ===== REDUCERS ===== */
    const [form, dispatchForm] = useReducer(reducer, formInit);

    /* ===== FUNCTIONS ===== */

    // FUNCTION 7: populateForm - function that executes when the StructureForm component mounts
    // PRECONDITIONS: NONE
    // POSTCONDITIONS (2 possible outcomes):
    // if the metadata key is stored locally, we need to match the form with this data
    // otherwise, this function does nothing
    const populateForm = async () => {
        // first, let's try to grab form data. if it does not exist, return early
        const formData = JSON.parse(localStorage.getItem(structureKey));
        if (!formData) {
            return;
        }
        
        // now, let's update our form, and also get the creator name from the database
        dispatchForm({ type: "values", data: formData });
    };

    // FUNCTION 8: queryCategories - function that grabs all categories
    // PRECONDITIONS: NONE
    // POSTCONDITIONS (2 possible outcomes):
    // if the query is successful, the `categories` state is updated with the values
    // if the query is unsuccessful, an error message is rendered to the user, and the `categories` state
    // remains unset
    const queryCategories = async () => {
        try {
            const categories = await queryAll("category", "id");
            categories.sort((a, b) => b.practice - a.practice);
            setCategories(categories);

        } catch (error) {
            addMessage("Categories could not be loaded. If refreshing the page does not work, the system may be experiencing an outage.", "error", 15000);
        };
    };

    // FUNCTION 9: isDuplicate - function that checks if an entity attempting to be added is already present in data
    // PRECONDITIONS (2 parameters):
    // 1.) data: the data the user has selected, that we wish to check
    // 2.) entityName: the string representing the set of `entityName` we want to check
    // POSTCONDITIONS (2 possible outcomes):
    // if `data` is already present in `form.values[entityName]`, return true
    // otherwise, render an error message, & return false
    const isDuplicate = (data, entityName) => {
        // first, let's ignore check for "remove" values. this is when data[entityName] is falsy
        if (!data[entityName]) {
            return false;
        }

        // if we made it this far, we are dealing with a typical entity. return true if entity exists in `form.values[entityName]`,
        // false otherwise.
        const result = form.values[entityName].some(v => v[entityName] === data[entityName]);
        if (result) {
            addMessage(`${ capitalize(entityName) } already selected.`, "error", 5000);
        }
        return result;
    };

    // FUNCTION 10: handleCategoryInsert - function that is called when the user adds a new category select row
    // PRECONDITIONS (2 parameters):
    // 1.) value: the value chosen by the user from the selector
    // 2.) id: an integer representing the id of the new entity - unused here, but passed from component
    // POSTCONDITIONS (2 possible outcome):
    // if the user selected a non-empty value, the new category is formed, and the form data is updated to include the new
    // category
    // if the user selected an empty / duplicate value, this function will ignore the change and do nothing
    const handleCategoryInsert = (value, id) => {
        const data = { id, category: value };
        if (value && !isDuplicate(data, "category")) {
            dispatchForm({ type: "insertCategory", data: data });
        }
    };

    // FUNCTION 11: handleCategoryUpdate - function that is called when the user updates an existing category row
    // PRECONDITIONS (2 parameters):
    // 1.) value: the value chosen by the user from the selector
    // 2.) id: an integer representing the id of the new entity - should be equal to the number of entities currently present
    // POSTCONDITIONS (3 possible outcomes):
    // if the user selects a non-empty value, the category will be updated
    // if the user selects a duplicate value, this function will render an error message 
    // otherwise, the system will delete the category
    const handleCategoryUpdate = (value, id) => {
        const data = { id, category: value };
        if (!isDuplicate(data, "category")) {
            dispatchForm({ type: "updateCategory", data: data });
        }
    }

    // FUNCTION 12: handleModeInsert - function that is called when the user wants to add a new mode to the list of modes
    // PRECONDITIONS (1 parametr):
    // 1.) category: the category we want to add the mode to
    // POSTCONDITIONS (1 possible outcome):
    // we determine where to add the mode, and add it
    const handleModeInsert = category => {
        let id;
        let categoryIndex = form.values.category.findIndex(c => c.category === category);
        let categoryModes = [];

        while (categoryIndex >= 0 && !id) {
            const categoryName = form.values.category[categoryIndex].category;
            categoryModes = form.values.mode.filter(m => m.category === categoryName);
            if (categoryModes.length > 0) {
                id = categoryModes.at(-1).id+1;
            }
            categoryIndex--;
        }

        // if id is still undefined at this point, implication is that this should have an id of 1
        if (!id) {
            id = 1;
        }

        const data = { name: "", category, id };
        dispatchForm({ type: "modesChange", data: data });
    }

    // FUNCTION 13: handleModeChange - code that is excuted each time the user makes a keystroke in a mode input
    // PRECONDITIONS (3 parameters):
    // 1.) mode: the string user input entered as the mode
    // 2.) category: the category the mode belongs to
    // 3.) id: the id of the mode
    // POSTCONDITIONS (2 possible outcomes):
    // if the user enters a non-empty value, the list of modes is updated to include it
    // otherwise, the system will delete the entity
    const handleModeChange = (mode, category, id) => {
        const data = { name: mode, category, id };
        dispatchForm({ type: "modesChange", data: data });
    };

    // FUNCTION 14: openPopup - function that is called when the user wishes to open the `CategoryAddForm`
    // PRECONDITIONS: NONE
    // POSTCONDITIONS (1 possible outcome):
    // the `addCategory` state is updated to "true", rendering the popup
    const openPopup = () => setAddCategory(true);

    // FUNCTION 15: closePopup - function that is called when the user wishes to close the `CategoryAddForm`
    // PRECONDITIONS: NONE
    // POSTCONDITIONS (1 possible outcome):
    // the `addCategory` state is updated to "false", unrendering the popup
    const closePopup = () => setAddCategory(false);

    return { 
        form, 
        addCategory, 
        populateForm, 
        queryCategories, 
        handleCategoryInsert, 
        handleCategoryUpdate,
        handleModeInsert,
        handleModeChange,
        openPopup,
        closePopup
    };
};

/* ===== EXPORTS ===== */
export default StructureForm;