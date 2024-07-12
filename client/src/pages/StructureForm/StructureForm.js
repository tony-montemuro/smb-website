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

    // FUNCTION 2: reducer - function that executes each time the user attempts to update the form reducer hook
    // PRECONDITIONS (2 parameters):
    // 1.) state: the state of the form object when the function is called
    // 2.) action: an object with three fields:
        // a.) field: specifies which field of the form the reducer should modify
        // b.) data: specifies the new value that the reducer should use to modify form[field]
        // c.) name: specifies the name of the entity we are currently interacting with
    // POSTCONDITIONS (5 possible outcomes):
    // if the type field is `insertValues`, we add new value to the `name` array, and update our values object
    // if the type is `updateValues`, we update the value already current to the `name` array, and update our values object
    // if the type is `values`, we simply update the values object using data
    // if the type is `error`, we simply update the error object using data
    // otherwise, this function does nothing 
    const reducer = (state, action) => {
        const { type, data, name } = action;
        let updatedValues;

		switch (type) {
            case "insertValues":
                const extended = [...state.values[name], data];
                updatedValues = { ...state.values, [name]: extended };

                updateLocal(updatedValues);
                return { ...state, values: updatedValues };
            case "updateValues":
                const updated = state.values[name].filter(v => v.id !== data.id);

                // only re-introduce data if value is defined. otherwise, this function behaves as a "delete"
                if (data[name]) {
                    updated.push(data);
                }

                updatedValues = { ...state.values, [name]: updated };
                updateLocal(updatedValues);
                return { ...state, values: updatedValues };
            case "modesChange":
                const updatedModes = [...state.values.mode];
                const targetIndex = updatedModes.findIndex(mode => mode.id === data.id && mode.category === data.category);

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
                    updatedModes[targetIndex] = data;
                }

                updatedValues = { ...state.values, mode: updatedModes };
                updateLocal(updatedValues);
                return { ...state, values: updatedValues };
            case "values":
                return { ...state, values: { ...state.values, ...data } };
			case "error":
                return { ...state, error: { ...state.error, ...data } };
			default:
				return null;
		}
    };

    /* ===== REDUCERS ===== */
    const [form, dispatchForm] = useReducer(reducer, formInit);

    /* ===== FUNCTIONS ===== */

    // FUNCTION 3: populateForm - function that executes when the StructureForm component mounts
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

    // FUNCTION 4: queryCategories - function that grabs all categories
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

    // FUNCTION 5: isDuplicate - function that checks if an entity attempting to be added is already present in data
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

    // FUNCTION 6: handleCategoryInsert - function that is called when the user adds a new category select row
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
            dispatchForm({ type: "insertValues", data: data, name: "category" });
        }
    };

    // FUNCTION 7: handleCategoryUpdate - function that is called when the user updates an existing category row
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
            dispatchForm({ type: "updateValues", data: data, name: "category" });
        }
    }

    // FUNCTION 8: handleModeChange - code that is excuted each time the user makes a keystroke in a mode input
    // PRECONDITIONS (3 parameters):
    // 1.) mode: the string user input entered as the mode
    // 2.) category: the category the mode belongs to
    // 3.) id: the id of the mode
    // POSTCONDITIONS (2 possible outcomes):
    // if the user enters a non-empty value, the list of modes is updated to include it
    // otherwise, the system will delete the entity
    const handleModeChange = (mode, category, id) => {
        // if `id` is null, define it here by finding the `id+1` of the last mode of the given category, or the last
        // category with values if no modes exist in the current category yet
        if (!id) {
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
        }

        // update form
        const data = { name: mode, category, id };
        dispatchForm({ type: "modesChange", data: data });
    };

    // FUNCTION 10: openPopup - function that is called when the user wishes to open the `CategoryAddForm`
    // PRECONDITIONS: NONE
    // POSTCONDITIONS (1 possible outcome):
    // the `addCategory` state is updated to "true", rendering the popup
    const openPopup = () => setAddCategory(true);

    // FUNCTION 11: closePopup - function that is called when the user wishes to close the `CategoryAddForm`
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
        handleModeChange,
        openPopup,
        closePopup
    };
};

/* ===== EXPORTS ===== */
export default StructureForm;