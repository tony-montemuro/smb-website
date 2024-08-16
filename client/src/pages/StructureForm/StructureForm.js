/* ===== IMPORTS ===== */
import { AppDataContext, GameAddContext, MessageContext } from "../../utils/Contexts";
import { isUrlSafe } from "../../utils/RegexPatterns.js";
import { useContext, useReducer, useState } from "react";
import FrontendHelper from "../../helper/FrontendHelper.js";
import LevelHelper from "../../helper/LevelHelper.js";
import RPCRead from "../../database/read/RPCRead.js";

const StructureForm = (formData, setFormData) => {
    /* ===== CONTEXTS ===== */
    
    // appData state from app data context
    const { appData } = useContext(AppDataContext);

    // keys object & unlock page function from game add context
    const { keys, unlockNextPage } = useContext(GameAddContext);

    // add message function from message context
    const { addMessage } = useContext(MessageContext);
    
    /* ===== STATES ===== */
    const [popup, setPopup] = useState({
        addCategory: false,
        addGoal: false 
    });

    /* ===== VARIABLES ===== */
    const categories = appData.categories;
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
        INSERT_CATEGORY: { name: "INSERT_CATEGORY", updateLocal: true },
        UPDATE_CATEGORY: { name: "UPDATE_CATEGORY", updateLocal: true },
        INSERT_MODE: { name: "INSERT_MODE", updateLocal: true },
        UPDATE_MODE: { name: "UPDATE_MODE", updateLocal: false },
        DELETE_MODE: { name: "DELETE_MODE", updateLocal: true },
        INSERT_LEVEL: { name: "INSERT_LEVEL", updateLocal: true },
        UPDATE_LEVEL: { name: "UPDATE_LEVEL", updateLocal: false },
        DELETE_LEVEL: { name: "DELETE_LEVEL", updateLocal: true },
    };

    /* ===== FUNCTIONS ===== */

    // database functions
    const { getChartTypes, getTimerTypes } = RPCRead();

    // helper variables & functions
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

    // FUNCTION 2: shiftErrors - function that takes a spare array of errors, and shifts errors at or after a given index
    // PRECONDITIONS (2 parameters):
    // 1.) errors: a spare array of errors
    // 2.) index: the index of the element we should start shifting
    // POSTCONDITIONS (1 possible outcome):
    // all elements at or after "index" in the array are shifted over by 1
    const shiftErrors = (errors, index) => {
        errors.length++;
        let i = errors.length-1;

        while (i > index) {
            errors[i] = errors[i-1];
            i--;
        }
        delete errors[i];

        return errors;
    };

    // FUNCTION 3: shiftElementsAndErrors - function that attempts to shift elements and errors by id, if necessary
    // than target id passed to the function
    // PRECONDITIONS (2 parameters):
    // 1.) elements: an array of objects, each with the `id` field
    // 2.) errors: (optional) a corresponding array of elements, where their indicies correspond to the `id` field of elements
    // this element may also be undefined
    // 3.) id: an integer representing the target id; we determine if elements & errors need to be shifted based on this
    // POSTCONDITIONS (2 returns, 1 possible outcome):
    // an object is returned, containing two values:
        // a.) elements: a copy of the elements parameter, shifted if necessary
        // b.) errors: a copy of the errors parameter, shifted if necessary
        const shiftElementsAndErrors = (elements, errors, id) => {
            elements = [...elements]; 
            errors = errors ? [...errors] : undefined;
    
            // find incidies of elements whose id is >= `id`
            const largerElementIndicies = elements.reduce((arr, element, index) => {
                if (element.id >= id) {
                    arr.push(index);
                }
                return arr;
            }, []);
            const firstIndex = largerElementIndicies[0];
    
            // now, do any shifts, if necessary
            if (largerElementIndicies.length > 0 && elements[firstIndex].id === id) {
                largerElementIndicies.forEach(index => elements[index].id++);
                if (errors) {
                    errors = shiftErrors(errors, firstIndex);
                }
            }
    
            return { elements, errors };
        };

    // FUNCTION 4: insertCategory - function that executes when the user performs an action to insert a category
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
        return { ...state, values: updatedValues };
    };

    // FUNCTION 5: updateCategory - function that executes when the user performs an action to update a category
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
            // find children of category
            const children = { mode: [], level: [] };
            children.mode = stateValues.mode.filter(mode => mode.category === oldCategoryName);
            children.level = stateValues.level.filter(level => level.category.name === oldCategoryName);

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
        return { ...state, values: updated };
    };

    // FUNCTION 6: insertMode - function that executes when the user "adds" a new mode
    // PRECONDITIONS (2 parameters):
    // 1.) state: the current state of the form
    // 2.) data: the user inputted-mode (object with three keys: id (int), name (string), and category (string))
    // POSTCONDITIONS (1 possible outcomes):
    // the mode is added to our list of modes in the form
    const insertMode = (state, data) => {
        const { 
            elements: updatedModes,
            errors: updatedModeErrors
        } = shiftElementsAndErrors(state.values.mode, state.error.mode, data.id);

        updatedModes.push(data);
        updatedModes.sort((a, b) => a.id - b.id);
        const updatedValues = { ...state.values, mode: updatedModes };
        const updatedErrors = { ...state.error, mode: updatedModeErrors };
        return { ...state, values: updatedValues, error: updatedErrors };
    };

    // FUNCTION 7: updateMode - function that executes when the user performs a change on a mode
    // PRECONDITIONS (2 parameters):
    // 1.) state: the current state of the form
    // 2.) data: the user inputted-mode (object with three keys: id (int), name (string), and category (string))
    // POSTCONDITIONS (1 possible outcomes):
    // the mode is located in our list of modes, and updated based on the data parameter, as well as any levels
    // within the mode
    const updateMode = (state, data) => {
        const updated = { ...state.values };
        const targetIndex = updated.mode.findIndex(mode => mode.id === data.id);

        // update mode, and cascade change down to child levels (if any)
        updated.mode[targetIndex] = data;
        updated.level = updated.level.map(level => level.mode.id === data.id ? 
            { ...level, mode: { id: data.id, name: data.name } } : 
            level);
        return { ...state, values: updated };
    };

    // FUNCTION 8: deleteMode - function that executes when the user performs a delete on a mode
    // PRECONDITIONS (2 parameters):
    // 1.) state: the current state of the form
    // 2.) data: the id of the mode we want to delete
    // POSTCONDITIONS (2 possible outcomes):
    // if the user selects "yes" from the popup, ther mode is deleted from our mode list, as well as all
    // children belonging to that mode
    // if the user selects "no" from the popup, no changes occur to the form
    const deleteMode = (state, id) => {
        const updatedValues = { ...state.values }, updatedErrors = { ...state.error };
        const childrenLevels = state.values.level.filter(level => level.mode.id === id);
        let warning = "Deleting this mode will also delete it's levels. Are you sure you want to do this?";

        // special case: warn the users if there exist any children of the mode. if they decide *not*
        // to delete the mode, this function does nothing
        if (childrenLevels.length > 0 && !window.confirm(warning)) {
            return state;
        }

        // delete mode, as well as any children levels, and mode error
        updatedValues.mode = updatedValues.mode.filter(mode => mode.id === id);
        updatedValues.level = updatedValues.level.filter(level => level.mode.id !== id);
        if (updatedErrors.mode) {
            delete updatedErrors.mode[id];
        }
        return { ...state, values: updatedValues, error: updatedErrors };
    };

    // FUNCTION 9: insertLevel - function that executes when the user performs an action to insert a level
    // 1.) state: the current state of the form
    // 2.) data: the user inputted-category (object with two keys: id (int) and category (string))
    // POSTCONDITIONS (1 possible outcomes):
    // the level is added to the form
    const insertLevel = (state, data) => {
        const { 
            elements: updatedLevels,
            errors: updatedLevelErrors
        } = shiftElementsAndErrors(state.values.level, state.error.level, data.id);

        updatedLevels.push(data);
        updatedLevels.sort((a, b) => a.id - b.id);
        const updatedValues = { ...state.values, level: updatedLevels };
        const updatedErrors = { ...state.error, level: updatedLevelErrors };
        return { ...state, values: updatedValues, error: updatedErrors };
    };

    // FUNCTION 10: updateLevel - function that is executed when the user performs an action to update a level
    // 1.) state: the current state of the form
    // 2.) data: the user inputted-changes
    // POSTCONDITIONS (1 possible outcome):
    // we find the targetted level, update the data, and update the state
    const updateLevel = (state, data) => {
        const levelUpdated = [...state.values.level];
        const levelIndex = levelUpdated.findIndex(level => level.id === data.id);
        levelUpdated[levelIndex] = { ...levelUpdated[levelIndex], ...data };
        const updatedValues = { ...state.values, level: levelUpdated };
        return { ...state, values: updatedValues };
    };

    // FUNCTION 11: deleteLevel - function that executes when the user performs a delete on a level
    // PRECONDITIONS (2 parameters):
    // 1.) state: the current state of the form
    // 2.) data: the id of the level we want to delete
    // POSTCONDITIONS (1 possible outcomes):
    // the level is deleted from the form data
    const deleteLevel = (state, id) => {
        const updatedValues = { ...state.values }, updatedErrors = { ...state.error };
        updatedValues.level = updatedValues.level.filter(level => level.id !== id);
        if (updatedErrors.level) {
            delete updatedErrors.level[id];
        }
        return { ...state, values: updatedValues, error: updatedErrors };
    };

    // FUNCTION 12: reducer - function that executes each time the user attempts to update the form reducer hook
    // PRECONDITIONS (2 parameters):
    // 1.) state: the state of the form object when the function is called
    // 2.) action: an object with three fields:
        // a.) field: specifies which field of the form the reducer should modify
        // b.) data: specifies the new value that the reducer should use to modify form[field]
        // c.) name: specifies the name of the entity we are currently interacting with
    // POSTCONDITIONS (3 possible outcomes):
    // if the type field matches a dispatch type, we perform the relevant action, update local data, and return the result
    // if the type field is not a dispatch type, but still matches with the outer switch statement, the relevant action is 
    // performed on the form
    // otherwise, this function simply returns the current state of the form, doing nothing
    const reducer = (state, action) => {
        const { type, data } = action;

        const dispatchType = Object.values(dispatchTypes).find(t => t.name === type);
        if (dispatchType) {
            let updatedState;
            
            switch (type) {
                case dispatchTypes.INSERT_CATEGORY.name:
                    updatedState = insertCategory(state, data);
                    break;
                case dispatchTypes.UPDATE_CATEGORY.name:
                    updatedState = updateCategory(state, data);
                    break;
                case dispatchTypes.INSERT_MODE.name:
                    updatedState = insertMode(state, data);
                    break;
                case dispatchTypes.UPDATE_MODE.name:
                    updatedState = updateMode(state, data);
                    break;
                case dispatchTypes.DELETE_MODE.name:
                    updatedState = deleteMode(state, data);
                    break;
                case dispatchTypes.INSERT_LEVEL.name:
                    updatedState = insertLevel(state, data);
                    break;
                case dispatchTypes.UPDATE_LEVEL.name:
                    updatedState = updateLevel(state, data);
                    break;
                case dispatchTypes.DELETE_LEVEL.name:
                    updatedState = deleteLevel(state, data);
                    break;
                default: return null;
            }

            // update local if dispatch type specifies to do so
            if (dispatchType.updateLocal) {
                updateLocal(updatedState.values);
            }
            return updatedState;
        }

		switch (type) {
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

    // FUNCTION 13: populateForm - function that executes when the StructureForm component mounts
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

    // FUNCTION 14: getTransformedCategories - function that takes `appData.categories` state from appData context, and 
    // converts to array
    // PRECONDITIONS: NONE
    // POSTCONDITIONS (1 possible outcomes):
    // the state is transform from a mapping of category names to category objects, to an array of category objects,
    // sorted by id, then practice flag
    const getTransformedCategories = () => {
        return Object.values(categories).toSorted((b, a) => b.practice - a.practice);
    };

    // FUNCTION 15: queryFormData - function that loads all data used by the form; should be ran when the `StructureForm` 
    // component mounts
    // PRECONDITIONS: NONE
    // POSTCONDITIONS (2 possible outcomes):
    // if the data is successfully loaded, we can update the `formData` state to include the results, which should render the form
    // otherwise, render an error message to the user, and keep the `formData` state undefined, so the form is unloaded
    const queryFormData = async () => {
        try {
            const [chartTypes, timerTypes] = await Promise.all(
                [getChartTypes(), getTimerTypes()]
            );
            let categoryList = getTransformedCategories();

            setFormData({ categories: categoryList, chartTypes, timerTypes });

        } catch (error) {
            addMessage("Data necessary to render the form failed to load. If reloading the page does not work, the system may be experiencing an outage.", "error", 10000);
        };
    };

    // FUNCTION 16: updateFormCategories - function that updates the `categories` field of the `formData` state
    // PRECONDITIONS: NONE
    // POSTCONDITIONS (2 possible outcomes):
    // if any categories exist, we assume a success, and update the categories state
    // otherwise, this function simply renders an error message
    const updateFormCategories = async () => {
        try {
            if (Object.values(categories).length > 0) {
                setFormData(prevState => ({ ...prevState, categories: getTransformedCategories() }));
            } else {
                throw new Error("There was a problem updating the categories data. If refreshing the page does not work, the system may be experiencing an outage.");
            }
            
        } catch (error) {
            addMessage(error.message, "error", 13000);
        };
    };

    // FUNCTION 17: isDuplicate - function that checks if an entity attempting to be added is already present in data
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

    // FUNCTION 18: handleCategoryInsert - function that is called when the user adds a new category select row
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
            dispatchForm({ type: dispatchTypes.INSERT_CATEGORY.name, data: data });
        }
    };

    // FUNCTION 19: handleCategoryUpdate - function that is called when the user updates an existing category row
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
            dispatchForm({ type: dispatchTypes.UPDATE_CATEGORY.name, data: data });
        }
    }

    // FUNCTION 20: handleModeInsert - function that is called when the user wants to add a new mode to the list of modes
    // PRECONDITIONS (1 parametr):
    // 1.) category: an object representing the category we want to add the mode to
    // 2.) id (optional): a integer, representing the id of the mode we want to add. if not provided, we assume
    // the largest possible id within the category
    // POSTCONDITIONS (1 possible outcome):
    // we determine where to add the mode, and add it
    const handleModeInsert = (category, id = null) => {
        const categoryName = category.category;

        if (id === null) {
            let categoryIndex = form.values.category.findIndex(c => c.id === category.id);

            while (categoryIndex >= 0 && id === null) {
                const categoryName = form.values.category[categoryIndex].category;
                const categoryModes = form.values.mode.filter(m => m.category === categoryName);
                if (categoryModes.length > 0) {
                    id = categoryModes.at(-1).id+1;
                }
                categoryIndex--;
            }

            // if id is still null at this point, implication is that this should have an id of 1
            if (id === null) {
                id = 1;
            }
        }

        const data = { name: "", category: categoryName, id };
        dispatchForm({ type: dispatchTypes.INSERT_MODE.name, data: data });
    }

    // FUNCTION 21: handleModeUpdate - code that is excuted each time the user makes a keystroke in a mode input
    // PRECONDITIONS (3 parameters):
    // 1.) mode: the string user input entered as the mode
    // 2.) category: a string representing the category the mode belongs to
    // 3.) id: an integer representing the id of the mode the user wants to update
    // POSTCONDITIONS (2 possible outcomes):
    // if the user enters a non-duplicate mode, the 
    const handleModeUpdate = (mode, category, id) => {
        const data = { name: levelF2B(mode), category: category, id };
        dispatchForm({ type: dispatchTypes.UPDATE_MODE.name, data: data });
    };

    // FUNCTION 22: handleModeDelete - code that is executed when the user decides to delete a mode
    // PRECONDITIONS (1 parameter):
    // 1.) id: an integer representing the id of the mode the user wants to delete
    // POSTCONDITIONS (1 possible outcome):
    // the system will attempt to delete the mode
    const handleModeDelete = id => dispatchForm({ type: dispatchTypes.DELETE_MODE.name, data: id });

    // FUNCTION 23: handleLevelInsert - function that is called when the user wants to add a new level to the list of levels
    // PRECONDITIONS (2 parameters):
    // 1.) category: the category we want to add the level to
    // 2.) mode: the mode (object) we want to add the level to
    // 3.) id (optional): a integer, representing the id of the level we want to add. if not provided, we assume
    // the largest possible id within the category + mode combination
    // POSTCONDITIONS (1 possible outcome):
    // we determine where to add the level, and add it
    const handleLevelInsert = (category, mode, id = null) => {
        const categories = form.values.category;
        const modes = form.values.mode;
        let modeIndex = modes.findIndex(m => m.id === mode.id);
        mode = { id: mode.id, name: mode.name };

        if (id === null) {
            let categoryIndex = categories.findIndex(c => c.category === category);

            while (categoryIndex >= 0 && id === null) {
                // find index of first mode in category
                const categoryName = categories[categoryIndex].category;
                let minModeIndex, index = modeIndex;
                while (!minModeIndex && index > 0) {
                    const mode = modes[index-1];
                    if (mode.category !== categoryName) {
                        minModeIndex = index; 
                    }
                    index--;
                }
                if (!minModeIndex) minModeIndex = 0;
                

                // with this information, attempt to find the id
                while (modeIndex >= minModeIndex && id === null) {
                    const modeId = modes[modeIndex].id;
                    const levels = form.values.level.filter(l => l.category === categoryName && l.mode.id === modeId);
                    if (levels.length > 0) {
                        id = levels.at(-1).id+1;
                    } else {
                        modeIndex--;
                    }
                }
                categoryIndex--;
                minModeIndex = modeIndex;
            }

            // if id is still null at this point, implication is that this should have an id of 1
            if (id === null) {
                id = 1;
            }
        }

        const data = {
            name: "",
            goal: "",
            category,
            mode,
            id: id,
            chart_type: "both",
            time: 60,
            timer_type: "sec_csec",
            ascending: null
        };
        dispatchForm({ type: dispatchTypes.INSERT_LEVEL.name, data });
    };

    // FUNCTION 24: getAscendingValue - function that takes the ascending type the user is interacting with, and
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

    // FUNCTION 25: handleLevelChange - code that is executed when the use modifies any of the level inputs
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
        
        dispatchForm({ type: dispatchTypes.UPDATE_LEVEL.name, data: update });
    };

    // FUNCTION 26: handleLevelDelete - code that is executed when the user decides to delete a level
    // PRECONDITIONS (1 parameter):
    // 1.) id: an integer representing the id of the level the user wants to delete
    // POSTCONDITIONS (1 possible outcome):
    // the system will attempt to delete the level
    const handleLevelDelete = id => dispatchForm({ type: dispatchTypes.DELETE_LEVEL.name, data: id });

    // FUNCTION 27: handleErrorReturn - function that is called at the end of each validator function to handle return
    // PRECONDITION (1 parameter):
    // 1.) errors: an array of errors
    // POSTCONDITIONS (2 possible outcomes):
    // if the errors array has at least one element, return it, removing the final character from each error (a space)
    // otherwise, return undefined
    const handleErrorReturn = errors => {
        if (errors.length === 0) {
            return undefined;
        }

        // if there is at least one error, let's remove space from end of each
        errors.forEach((error, index) => {
            errors[index] = error.slice(0, -1);
        });

        return errors;
    };

    // FUNCTION 28: validateCategories - function that validates each category
    // PRECONDITIONS (1 parameter):
    // 1.) categories - the list of categories we want to validate
    // POSTCONDITIONS (2 possible outcomes):
    // if we validate the categories list is valid, do not return anything
    // otherwise, return a string with the error message
    const validateCategories = categoriesList => {
        if (categoriesList.length === 0) {
            return "Must have at least one category.";
        }

        let errorMsg = "";
        const hasModes = {};
        form.values.mode.forEach(mode => {
            const { category } = mode;
            if (!hasModes[category]) {
                hasModes[category] = true;
            }
        });
        let hasInvalid = false, hasMissingModes = false;

        categoriesList.forEach(obj => {
            const { category } = obj;

            // ensure category exists, and is well-formed
            if (!categories[category] || typeof category !== "string") {
                hasInvalid = true;
            }
            if (!hasModes[category]) {
                hasMissingModes = true;
            }
        });

        if (hasInvalid) {
            errorMsg += "One or more categories have invalid values, contact TonySMB for help. ";
        }
        if (hasMissingModes) {
            errorMsg += "One or more categories have no modes and no levels. ";
        }

        return errorMsg ? errorMsg.slice(0, -1) : undefined;
    };

    // FUNCTION 29: duplicateCheck - generic function that checks a "seen" object for duplicates, & updates errors accordingly
    // PRECONDITIONS (3 parameters):
    // 1.) seen: an object, that maps some key to an array of ids
    // 2.) errors: a spare array of error messages
    // 3.) duplicateMessage: the duplicate message we want to render to the user
    // POSTCONDITIONS (1 possible outcome):
    // we iterate over the seen object values. if any have >1 ids, we append a duplication
    const duplicateCheck = (seen, errors, duplicateMessage) => {
        Object.values(seen).forEach(idLists => {
            if (idLists.length > 1) {
                idLists.forEach(id => {
                    if (errors[id]) {
                        errors[id] += duplicateMessage;
                    } else {
                        errors[id] = duplicateMessage;
                    }
                });
            }
        });
    };

    // FUNCTION 30: validateModes - function that validates each mode
    // PRECONDITIONS (1 parameter):
    // 1.) modes - the list of modes we want to validate
    // POSTCONDITIONS (3 possible outcomes):
    // if we validate the modeList is valid, do not return anything
    // if modeList is empty, return a string letting the user know
    // otherwise, return an array, where we map mode id => error message
    const validateModes = modeList => {
        const errors = [];
        const hasLevels = {}, seenModes = {};
        form.values.level.forEach(level => {
            const { mode } = level;
            if (!hasLevels[mode.name]) {
                hasLevels[mode.name] = true;
            }
        });

        modeList.forEach(obj => {
            const { id, name, category } = obj;
            let errorMsg = "";
            
            // ensure category is valid
            if (!form.values.category.map(c => c.category).includes(category)) {
                errorMsg += "Mode belongs to an invalid category, contact TonySMB for help. ";
            }

            // next, ensure mode name is well-formed
            if (typeof name !== "string") {
                errorMsg += "Mode must be a word. ";
            }
            if (name.length === 0) {
                errorMsg += "Mode cannot be empty. ";
            }
            if (name.length > 0 && !isUrlSafe.test(name)) {
                errorMsg += "Mode includes an unsafe special character. ";
            }

            // ensure mode has >0 levels
            if (!hasLevels[name]) {
                errorMsg += "Mode must have at least one level. ";
            }

            // update seenModes object
            const key = JSON.stringify({ name, category });
            if (!seenModes[key]) {
                seenModes[key] = [id];
            } else {
                seenModes[key].push(id);
            }

            // if any errors were identified, let's update errors array
            if (errorMsg) {
                errors[id] = errorMsg;
            }
        });

        // finally, check for duplicate modes within each category
        const duplicateMessage = "Duplicate mode within this category. ";
        duplicateCheck(seenModes, errors, duplicateMessage);
        return handleErrorReturn(errors);
    };

    // FUNCTION 31: validateLevels - function that validates each level
    // PRECONDITIONS (1 parameter):
    // 1.) modes - the list of levels we want to validate
    // POSTCONDITIONS (3 possible outcomes):
    // if we validate the levelList is valid, do not return anything
    // if levelList is empty, return a string letting the user know
    // otherwise, return an array, where we map level id => error message
    const validateLevels = levelList => {
        const errors = [];
        const seenCharts = {};

        levelList.forEach(level => {
            const { ascending, category, chart_type, goal, id, mode, name, time, timer_type } = level;
            let errorMsg = "";

            // first, validate category is valid
            if (!form.values.category.map(c => c.category).includes(category)) {
                errorMsg += "Level assigned to invalid category, contact TonySMB for help. ";
            }

            // next, validate mode is valid
            if (!form.values.mode.map(m => m.id).includes(mode.id)) {
                errorMsg += "Level assigned to invalid mode, contact TonySMB for help. ";
            }

            // next, validate id is an integer
            if (typeof id !== "number" || !Number.isInteger(id)) {
                errorMsg += "Level assigned an invalid id, contact TonySMB for help. ";
            }

            // next, the level name is safe, well-formatted
            if (name.length === 0) {
                errorMsg += "Name is required. ";
            }
            if (name.length > 0 && !isUrlSafe.test(name)) {
                errorMsg += "Name includes an unsafe special character. ";
            }

            // next, validate the goal is safe, well-formatted
            if (!appData.goals.some(g => g.name === goal) && goal !== "") {
                errorMsg += "Goal is not a valid value. ";
            }

            // next, let's handle fields dependent on chart type
            if (chart_type === "score") {
                if (timer_type !== "") {
                    errorMsg += "Timer Type should be unset when Chart Type is Score. ";
                }
                if (time !== 0) {
                    errorMsg += "Time should be 0 when Chart Type is Score. ";
                }
                if (["both", "time"].includes(ascending)) {
                    errorMsg += "Ascend Time cannot be checked when Chart Type is Score. ";
                }
            } else {
                if (timer_type === "") {
                    errorMsg += "Timer Type is required when Chart Type is Time or Both. ";
                }
                if (chart_type === "time" && ["both", "score"].includes(ascending)) {
                    errorMsg += "Ascend Score cannot be checked when Chart Type is Time." ;
                }
            }

            // next, let's handle fields dependent on ascending
            if (["time", "both"].includes(ascending)) {
                if (time !== 0) {
                    errorMsg += "Time must be 0 when Ascending Time is checked. ";
                }
            }

            // next, let's validate chart type
            if (!formData.chartTypes.includes(chart_type)) {
                errorMsg += "Chart Type is not a valid value. ";
            }

            // next, let's validate timer type
            if (timer_type !== "" && !formData.timerTypes.includes(timer_type)) {
                errorMsg += "Timer Type is not a valid value. ";
            }

            // TODO: this should be fixed with a timer type update. for now, this works.
            // next, let's validate time
            if (time === "") {
                errorMsg += "Time is required. ";
            } else {
                const fraction = String(time).split(".")[1];
                if (timer_type.endsWith("msec")) {
                    if (fraction && fraction.length > 3) {
                        errorMsg += "Invalid number of decimals on time. ";
                    }
                } else if (timer_type.endsWith("csec")) {
                    if (fraction && fraction.length > 2) {
                        errorMsg += "Invalid number of decimals on time. ";
                    }
                } else {
                    if (fraction) {
                        errorMsg += "Invalid number of decimals on time. ";
                    }
                }
            }
            
            // update seenCharts object
            const key = JSON.stringify({ category, name, goal });
            if (!seenCharts[key]) {
                seenCharts[key] = [id];
            } else {
                seenCharts[key].push(id);
            }

            if (errorMsg) {
                errors[id] = errorMsg;
            }
        });

        // finally, check for duplicate name + goal combinations within each category
        const duplicateMessage = "Duplicate Name + Goal combination within this category. ";
        duplicateCheck(seenCharts, errors, duplicateMessage);
        return handleErrorReturn(errors);
    };

    // FUNCTION 32: validateStructure - function that ensures the the user-inputted game structure is valid
    // PRECONDITIONS (1 parameter):
    // 1.) e: the event object generated by the submit event on the game structure form
    // POSTCONDITIONS (2 possible outcomes):
    // if the form validates successfully, unlock the next page, and update local storage
    // if the form fails to validate, update the form state to display errors
    const validateStructure = e => {
        e.preventDefault();
        
        // validate parts of structure: categories, modes, and levels
        const error = {};
        
        error.category = validateCategories(form.values.category);
        error.mode = validateModes(form.values.mode);
        error.level = validateLevels(form.values.level);

        // if no errors are detected, unlock next page, and update local storage
        if (!Object.values(error).some(e => e !== undefined)) {
            unlockNextPage();
        } else {
            addMessage("Form not validated, please check error messages.", "error", 8000);
        }

        dispatchForm({ type: "error", data: error });
    };

    // FUNCTION 33: openCategoryPopup - function that is called when the user wishes to open the `CategoryAddForm`
    // PRECONDITIONS: NONE
    // POSTCONDITIONS (1 possible outcome):
    // the `openState.addCategory` state is updated to "true", rendering the popup
    const openCategoryPopup = () => setPopup({ ...popup, addCategory: true });

    // FUNCTION 34: closeCategoryPopup - function that is called when the user wishes to close the `CategoryAddForm`
    // PRECONDITIONS: NONE
    // POSTCONDITIONS (1 possible outcome):
    // the `openState.addCategory` state is updated to "false", unrendering the popup
    const closeCategoryPopup = () => setPopup({ ...popup, addCategory: false });

    // FUNCTION 35: openGoalPopup - function that is called when the user wishes to open the `GoalAddForm`
    // PRECONDITIONS: NONE
    // POSTCONDITIONS (1 possible outcome):
    // the `openState.addGoal` state is updated to "true", rendering the popup
    const openGoalPopup = () => setPopup({ ...popup, addGoal: true });

    // FUNCTION 36: closeGoalPopup - function that is called when the user wishes to close the `GoalAddForm`
    // PRECONDITIONS: NONE
    // POSTCONDITIONS (1 possible outcome):
    // the `openState.addGoal` state is updated to "false", unrendering the popup
    const closeGoalPopup = () => setPopup({ ...popup, addGoal: false });

    return { 
        form, 
        popup,
        updateLocal, 
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
        validateStructure,
        openCategoryPopup,
        closeCategoryPopup,
        openGoalPopup,
        closeGoalPopup
    };
};

/* ===== EXPORTS ===== */
export default StructureForm;