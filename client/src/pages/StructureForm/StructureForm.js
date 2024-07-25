/* ===== IMPORTS ===== */
import { useContext, useReducer, useState } from "react";
import { GameAddContext, MessageContext } from "../../utils/Contexts";
import FrontendHelper from "../../helper/FrontendHelper.js";
import LevelHelper from "../../helper/LevelHelper.js";
import Read from "../../database/read/Read.js";
import RPCRead from "../../database/read/RPCRead.js";

const StructureForm = (setFormData) => {
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
    const dispatchTypes = {
        INSERT_CATEGORY: "INSERT_CATEGORY",
        UPDATE_CATEGORY: "UPDATE_CATEGORY",
        INSERT_MODE: "INSERT_MODE",
        UPDATE_MODE: "UPDATE_MODE",
        DELETE_MODE: "DELETE_MODE",
        INSERT_LEVEL: "INSERT_LEVEL",
        UPDATE_LEVEL: "UPDATE_LEVEL",
        DELETE_LEVEL: "DELETE_LEVEL"
    };

    /* ===== FUNCTIONS ===== */

    // database functions
    const { queryAll } = Read();
    const { getChartTypes, getTimerTypes } = RPCRead();

    // helper functions
    const { capitalize } = FrontendHelper();
    const { levelF2B } = LevelHelper();

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
        const oldCategoryName = stateValues.category.find(c => c.id === data.id).category;
        if (!data.category) {
            const children = findChildren(stateValues, "category", oldCategoryName);
            let warning = "Deleting this category will also delete it's ";
            warning += children.level.length > 0 ? "modes & levels." : "modes.";
            warning += " Are you sure you want to do this?";

            // special case: warn the users if there exist any children of the category. if they decide *not*
            // to delete the category, this function does nothing
            if ((children.mode.length > 0 || children.level.length > 0) && !window.confirm(warning)) {
                return state;
            }

            // otherwise, we need to go ahead and remove all children as well
            updated.level = updated.level.filter(level => level.category !== oldCategoryName);
            updated.mode = updated.mode.filter(mode => mode.category !== oldCategoryName);

        } else {
            // now, we need to update category, and cascade change down to modes & levels
            updated.category.push(data);

            const cascade = arg => arg.category === oldCategoryName ? { ...arg, category: data.category } : arg;
            updated.mode = updated.mode.map(cascade);
            updated.level = updated.level.map(cascade);

            updated.category.sort((a, b) => a.id - b.id);
        }

        updateLocal(updated);
        return { ...state, values: updated };
    };

    // FUNCTION 5: insertMode - function that executes when the user "adds" a new mode
    // PRECONDITIONS (2 parameters):
    // 1.) state: the current state of the form
    // 2.) data: the user inputted-mode (object with three keys: id (int), name (string), and category (string))
    // POSTCONDITIONS (1 possible outcomes):
    // the mode is added to our list of modes in the form
    const insertMode = (state, data) => {
        const updated = { ...state.values };

        for (let mode of updated.mode) {
            if (mode.id >= data.id) {
                mode.id++;
            }
        }

        updated.mode.push(data);
        updated.mode.sort((a, b) => a.id - b.id);

        updateLocal(updated);
        return { ...state, values: updated };
    };

    // FUNCTION 6: updateMode - function that executes when the user performs a change on a mode
    // PRECONDITIONS (2 parameters):
    // 1.) state: the current state of the form
    // 2.) data: the user inputted-mode (object with three keys: id (int), name (string), and category (string))
    // POSTCONDITIONS (1 possible outcomes):
    // the mode is located in our list of modes, and updated based on the data parameter
    const updateMode = (state, data) => {
        const updated = { ...state.values };
        const targetIndex = updated.mode.findIndex(mode => mode.id === data.id);
        const oldModeName = updated.mode[targetIndex].name;

        // update mode, and cascade change down to child levels (if any)
        updated.mode[targetIndex] = data;
        updated.level.map(level => level.mode === oldModeName ? { ...level, mode: data.mode } : level);

        updateLocal(updated);
        return { ...state, values: updated };
    };

    // FUNCTION 7: deleteMode - function that executes when the user performs a delete on a mode
    // PRECONDITIONS (2 parameters):
    // 1.) state: the current state of the form
    // 2.) data: the id of the mode we want to delete
    // POSTCONDITIONS (2 possible outcomes):
    // if the user selects "yes" from the popup, ther mode is deleted from our mode list, as well as all
    // children belonging to that mode
    // if the user selects "no" from the popup, no changes occur to the form
    const deleteMode = (state, id) => {
        const matchingModeCondition = mode => mode.id === id;
        const updated = { ...state.values };
        const targetIndex = updated.mode.findIndex(mode => matchingModeCondition(mode));
        const oldModeName = updated.mode[targetIndex].name;
        const children = findChildren(state.values, "mode", oldModeName);
        let warning = "Deleting this mode will also delete it's levels. Are you sure you want to do this?";

        // special case: warn the users if there exist any children of the mode. if they decide *not*
        // to delete the mode, this function does nothing
        if (children.level.length > 0 && !window.confirm(warning)) {
            return state;
        }

        // delete mode, as well as any children levels
        updated.mode = updated.mode.filter(mode => !matchingModeCondition(mode));
        updated.level = updated.level.filter(level => level.mode !== oldModeName);

        updateLocal(updated);
        return { ...state, values: updated };
    };

    // FUNCTION 8: insertLevel - function that executes when the user performs an action to insert a level
    // 1.) state: the current state of the form
    // 2.) data: the user inputted-category (object with two keys: id (int) and category (string))
    // POSTCONDITIONS (1 possible outcomes):
    // the level is added to the form
    const insertLevel = (state, data) => {
        let updatedLevels = [...state.values.level];
        let mustIncrement = false;

        // find the indicies of all levels where the id is >= data.id
        const laterLevelIndicies = updatedLevels.reduce((arr, level, index) => {
            if (level.id >= data.id) {
                if (level.id === data.id) {
                    mustIncrement = true;
                }
                arr.push(index);
            }
            return arr;
        }, []);

        // if we determine that mass-increment is necessary, do it
        if (mustIncrement) {
            laterLevelIndicies.forEach(index => updatedLevels[index].id++);
        }

        updatedLevels.push(data);
        updatedLevels.sort((a, b) => a.id - b.id);
        const updatedValues = { ...state.values, level: updatedLevels };
        updateLocal(updatedValues);
        return { ...state, values: updatedValues };
    };

    // FUNCTION 9: updateLevel - function that is executed when the user performs an action to update a level
    // 1.) state: the current state of the form
    // 2.) data: the user inputted-changes
    // POSTCONDITIONS (1 possible outcome):
    // we find the targetted level, update the data, and update the state
    const updateLevel = (state, data) => {
        const levelUpdated = [...state.values.level];
        const levelIndex = levelUpdated.findIndex(level => level.id === data.id);
        levelUpdated[levelIndex] = { ...levelUpdated[levelIndex], ...data };
        const updatedValues = { ...state.values, level: levelUpdated };
        updateLocal(updatedValues);
        return { ...state, values: updatedValues };
    };

    // FUNCTION 10: deleteLevel - function that executes when the user performs a delete on a level
    // PRECONDITIONS (2 parameters):
    // 1.) state: the current state of the form
    // 2.) data: the id of the level we want to delete
    // POSTCONDITIONS (1 possible outcomes):
    // the level is deleted from the form data
    const deleteLevel = (state, id) => {
        const updated = { ...state.values };
        updated.level = updated.level.filter(level => level.id !== id);
        updateLocal(updated);
        return { ...state, values: updated };
    };

    // FUNCTION 11: reducer - function that executes each time the user attempts to update the form reducer hook
    // PRECONDITIONS (2 parameters):
    // 1.) state: the state of the form object when the function is called
    // 2.) action: an object with three fields:
        // a.) field: specifies which field of the form the reducer should modify
        // b.) data: specifies the new value that the reducer should use to modify form[field]
        // c.) name: specifies the name of the entity we are currently interacting with
    // POSTCONDITIONS (2 possible outcomes):
    // if the type field is properly matched within the switch statement, the relevant action is performed on the form
    // otherwise, this function simply returns the current state of the form, doing nothing
    const reducer = (state, action) => {
        const { type, data } = action;

		switch (type) {
            case dispatchTypes.INSERT_CATEGORY:
                return insertCategory(state, data);
            case dispatchTypes.UPDATE_CATEGORY:
                return updateCategory(state, data);
            case dispatchTypes.INSERT_MODE:
                return insertMode(state, data);
            case dispatchTypes.UPDATE_MODE:
                return updateMode(state, data);
            case dispatchTypes.DELETE_MODE:
                return deleteMode(state, data);
            case dispatchTypes.INSERT_LEVEL:
                return insertLevel(state, data);
            case dispatchTypes.UPDATE_LEVEL:
                return updateLevel(state, data);
            case dispatchTypes.DELETE_LEVEL:
                return deleteLevel(state, data);
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

    // FUNCTION 12: populateForm - function that executes when the StructureForm component mounts
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

    // FUNCTION 13: queryCategories - function that queries the database for categories, used by the categories dropdown
    // PRECONDITIONS: NONE
    // POSTCONDITIONS (2 possible outcomes):
    // if query is successful, sort the categories by practice flag, and return
    // otherwise, the function throws an error, which should be handled by the caller function
    const queryCategories = async () => {
        try {
            const categories = await queryAll("category", "id");

            categories.sort((a, b) => b.practice - a.practice);
            return categories;

        } catch (error) {
            throw error;
        };
    };

    // FUNCTION 14: queryFormData - function that loads all data used by the form; should be ran when the `StructureForm` 
    // component mounts
    // PRECONDITIONS: NONE
    // POSTCONDITIONS (2 possible outcomes):
    // if the data is successfully loaded, we can update the `formData` state to include the results, which should render the form
    // otherwise, render an error message to the user, and keep the `formData` state undefined, so the form is unloaded
    const queryFormData = async () => {
        try {
            const [categories, chartTypes, timerTypes] = await Promise.all(
                [queryCategories(), getChartTypes(), getTimerTypes()]
            );

            setFormData({ categories, chartTypes, timerTypes });

        } catch (error) {
            addMessage("Data necessary to render the form failed to load. If reloading the page does not work, the system may be experiencing an outage.", "error", 10000);
        };
    };

    // FUNCTION 15: updateFormCategories - function that updates the `categories` field of the `formData` state
    // PRECONDITIONS: NONE
    // POSTCONDITIONS (2 possible outcomes):
    // if the query is successful, update the categories field of the `formData` state
    // otherwise, this function simply renders an error message. the context this function is called is typically after a user
    // adds a new category to the database. if we got this far, and failed, it means the category was inserted, but the read
    // failed for whatever reason
    const updateFormCategories = async () => {
        try {
            const categories = await queryCategories();
            setFormData(prevState => ({ ...prevState, categories }));
            
        } catch (error) {
            addMessage("Category was successfully added, but the form failed to update with the new category. If refreshing the page does not work, the system may be experiencing an outage.", "error", 15000);
        };
    };

    // FUNCTION 16: isDuplicate - function that checks if an entity attempting to be added is already present in data
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

    // FUNCTION 17: handleCategoryInsert - function that is called when the user adds a new category select row
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
            dispatchForm({ type: dispatchTypes.INSERT_MODE, data: data });
        }
    };

    // FUNCTION 18: handleCategoryUpdate - function that is called when the user updates an existing category row
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
            dispatchForm({ type: dispatchTypes.UPDATE_CATEGORY, data: data });
        }
    }

    // FUNCTION 19: handleModeInsert - function that is called when the user wants to add a new mode to the list of modes
    // PRECONDITIONS (1 parametr):
    // 1.) category: an object representing the category we want to add the mode to
    // 2.) id (optional): a integer, representing the id of the mode we want to add. if not provided, we assume
    // the largest possible id within the category
    // POSTCONDITIONS (1 possible outcome):
    // we determine where to add the mode, and add it
    const handleModeInsert = (category, id = null) => {
        const categoryName = category.category;

        if (!id) {
            let categoryIndex = form.values.category.findIndex(c => c.id === category.id);

            while (categoryIndex >= 0 && !id) {
                const categoryName = form.values.category[categoryIndex].category;
                const categoryModes = form.values.mode.filter(m => m.category === categoryName);
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

        const data = { name: "", category: categoryName, id };
        dispatchForm({ type: dispatchTypes.INSERT_MODE, data: data });
    }

    // FUNCTION 20: handleModeUpdate - code that is excuted each time the user makes a keystroke in a mode input
    // PRECONDITIONS (3 parameters):
    // 1.) mode: the string user input entered as the mode
    // 2.) category: a string representing the category the mode belongs to
    // 3.) id: an integer representing the id of the mode the user wants to update
    // POSTCONDITIONS (2 possible outcomes):
    // if the user enters a non-empty value, the list of modes is updated to include it
    // otherwise, the system will attempt to delete the entity
    const handleModeUpdate = (mode, category, id) => {
        const data = { name: mode, category: category, id };
        dispatchForm({ type: dispatchTypes.UPDATE_MODE, data: data });
    };

    // FUNCTION 21: handleModeDelete - code that is executed when the user decides to delete a mode
    // PRECONDITIONS (1 parameter):
    // 1.) id: an integer representing the id of the mode the user wants to delete
    // POSTCONDITIONS (1 possible outcome):
    // the system will attempt to delete the mode
    const handleModeDelete = id => dispatchForm({ type: dispatchTypes.DELETE_MODE, data: id });

    // FUNCTION 22: handleLevelInsert - function that is called when the user wants to add a new level to the list of levels
    // PRECONDITIONS (2 parameters):
    // 1.) category: the category we want to add the level to
    // 2.) mode: the mode we want to add the level to
    // POSTCONDITIONS (1 possible outcome):
    // we determine where to add the level, and add it
    const handleLevelInsert = (category, mode) => {
        let id;
        let categoryIndex = form.values.category.findIndex(c => c.category === category);
        let modeIndex = form.values.mode.findIndex(m => m.name === mode);

        while (categoryIndex >= 0 && !id) {
            const categoryName = form.values.category[categoryIndex].category;
            while (modeIndex >= 0 && !id) {
                const modeName = form.values.mode[modeIndex].name;
                const categoryModeLevels = form.values.level.filter(l => l.category === categoryName && l.mode === modeName);
                if (categoryModeLevels.length > 0) {
                    id = categoryModeLevels.at(-1).id+1;
                }
                modeIndex--;
            }
            categoryIndex--;
        }

        // if id is still undefined at this point, implication is that this should have an id of 1
        if (!id) {
            id = 1;
        }

        const data = {
            name: "",
            category,
            mode,
            id: id,
            chart_type: "both",
            time: 60,
            timer_type: "sec_csec",
            ascending: null
        };
        dispatchForm({ type: dispatchTypes.INSERT_LEVEL, data });
    };

    // FUNCTION 23: getAscendingValue - function that takes the ascending type the user is interacting with, and
    // determines how the ascending state is updated
    // PRECONDITIONS (3 parameters):
    // 1.) a string, either "score" or "time"
    // 2.) a boolean which determines whether or not the checkbox is switched ON or OFF 
    // 3.) a level object which represents the level in the form the user is interacting with
    // POSTCONDITIONS (1 possible outcome):
    // using form data, we determine the new value of "ascending", and return it
    const getAscendingValue = (type, checked, level) => {
        const otherType = type === "score" ? "time" : "score";
        const ascending = level.ascending;

        if (ascending === null && checked) {
            return type;
        }
        if (ascending === otherType && checked) {
            return "both";
        }
        if (ascending === "both" && !checked) {
            return otherType;
        }
        return null;
    };

    // FUNCTION 24: handleLevelChange - code that is executed when the use modifies any of the level inputs
    // PRECONDITIONS (1 parameter):
    // 1.) an event object generated by the user's keystroke within the input
    // POSTCONDITIONS (1 possible outcome):
    // any side-effects from the user input are applied here, and the level is updated accordingly
    const handleLevelChange = e => {
        let { id, value, checked } = e.target;
        const idVals = id.split("-");
        const levelId = parseInt(idVals.at(-2));
        const level = form.values.level.find(level => level.id === levelId);
        let field = idVals.at(-1);

        // special case: if we are dealing with an ascending field, let's determine singular value
        if (field.startsWith("ascending")) {
            let fieldVals = field.split(".");
            field = fieldVals[0];
            value = getAscendingValue(fieldVals[1], checked, level);
        }

        // add any "side effects" caused by certain inputs on certain fields
        const update = { id: levelId, [field]: value };
        switch (field) {
            case "chart_type":
                if (value === "score") {
                    update.time = 0;
                    update.timer_type = "";
                }

                if (["score", "time"].includes(value)) {
                    if (level.ascending === "both") {
                        update.ascending = value;
                    } else if (value !== level.ascending) {
                        update.ascending = null;
                    }
                }
                break;

            case "ascending":
                if (["both", "time"].includes(value)) {
                    update.time = 0;
                }
                break;

            case "name":
                update.name = levelF2B(value);
                break;
                
            default: break;
        };
        
        dispatchForm({ type: dispatchTypes.UPDATE_LEVEL, data: update });
    };

    // FUNCTION 25: handleLevelDelete - code that is executed when the user decides to delete a level
    // PRECONDITIONS (1 parameter):
    // 1.) id: an integer representing the id of the level the user wants to delete
    // POSTCONDITIONS (1 possible outcome):
    // the system will attempt to delete the level
    const handleLevelDelete = id => dispatchForm({ type: dispatchTypes.DELETE_LEVEL, data: id });

    // FUNCTION 26: openPopup - function that is called when the user wishes to open the `CategoryAddForm`
    // PRECONDITIONS: NONE
    // POSTCONDITIONS (1 possible outcome):
    // the `addCategory` state is updated to "true", rendering the popup
    const openPopup = () => setAddCategory(true);

    // FUNCTION 27: closePopup - function that is called when the user wishes to close the `CategoryAddForm`
    // PRECONDITIONS: NONE
    // POSTCONDITIONS (1 possible outcome):
    // the `addCategory` state is updated to "false", unrendering the popup
    const closePopup = () => setAddCategory(false);

    return { 
        form, 
        addCategory, 
        populateForm, 
        queryFormData,
        updateFormCategories, 
        handleCategoryInsert, 
        handleCategoryUpdate,
        handleModeInsert,
        handleModeUpdate,
        handleModeDelete,
        handleLevelInsert,
        handleLevelChange,
        handleLevelDelete,
        openPopup,
        closePopup
    };
};

/* ===== EXPORTS ===== */
export default StructureForm;