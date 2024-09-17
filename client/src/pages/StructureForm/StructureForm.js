/* ===== IMPORTS ===== */
import { AppDataContext, GameAddContext, MessageContext } from "../../utils/Contexts";
import { useContext, useReducer, useState } from "react";
import AscendingHelper from "../../helper/AscendingHelper.js";
import FrontendHelper from "../../helper/FrontendHelper.js";
import LevelHelper from "../../helper/LevelHelper.js";
import GameAddValidation from "../../components/GameAddLayout/GameAddValidation.js";

const StructureForm = (chartDefaults, setChartDefaults) => {
    /* ===== CONTEXTS ===== */

    // app data state from app data context
    const { appData } = useContext(AppDataContext);

    // keys object, unlock page function, & structure data from game add context
    const { keys, unlockNextPage, structureData } = useContext(GameAddContext);

    // add message function from message context
    const { addMessage } = useContext(MessageContext);
    
    /* ===== STATES ===== */
    const [popup, setPopup] = useState({
        addCategory: false,
        addGoal: false 
    });
    const [visibleCharts, setVisibleCharts] = useState(null);

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
        INSERT_CATEGORY: { name: "INSERT_CATEGORY", updateLocal: true },
        UPDATE_CATEGORY: { name: "UPDATE_CATEGORY", updateLocal: true },
        INSERT_MODE: { name: "INSERT_MODE", updateLocal: true },
        UPDATE_MODE: { name: "UPDATE_MODE", updateLocal: false },
        DELETE_MODE: { name: "DELETE_MODE", updateLocal: true },
        INSERT_LEVEL: { name: "INSERT_LEVEL", updateLocal: true },
        UPDATE_LEVEL: { name: "UPDATE_LEVEL", updateLocal: true },
        DELETE_LEVEL: { name: "DELETE_LEVEL", updateLocal: true },
    };

    /* ===== FUNCTIONS ===== */

    // helper variables & functions
    const { capitalize } = FrontendHelper();
    const { levelF2B } = LevelHelper();
    const { getAscendingValue } = AscendingHelper();

    // validation function
    const { validateStructure } = GameAddValidation();
 
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
                errors = shiftErrors(errors, id);
            }
        }

        return { elements, errors };
    };

    // FUNCTION 4: getDataWithName - function that returns categories data object with the name included
    // PRECONDITIONS (1 parameter):
    // 1.) data: an object generated by the user's form selection: contains the form id (id), and category id (category)
    // POSTCONDITIONS (1 possible outcome):
    // a copy of data is returned, including the name of the category, which we can grab from the 
    // `structureData.categories` object
    const getCategoryDataWithName = categoryData => {
        return { ...categoryData, name: structureData.categories.find(c => c.abb === categoryData.category).name }
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
            category: [...state.values.category, getCategoryDataWithName(data)]
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
            updated.category.push(getCategoryDataWithName(data));

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
        
        // now, we need to shift level mode ids, if necessary
        const updatedLevels = state.values.level.map(level => {
            if (level.mode.id >= data.id) {
                return { ...level, mode: { ...level.mode, id: level.mode.id+1 } };
            }
            return level;
        });

        updatedModes.push(data);
        updatedModes.sort((a, b) => a.id - b.id);
        const updatedValues = { ...state.values, mode: updatedModes, level: updatedLevels };
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
        updatedValues.mode = updatedValues.mode.filter(mode => mode.id !== id);
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
    // 2.) data: the updated level object
    // POSTCONDITIONS (1 possible outcome):
    // we find the targetted level, update the data, and update the state
    const updateLevel = (state, data) => {
        const levelUpdated = [...state.values.level];
        const levelIndex = levelUpdated.findIndex(level => level.id === data.id);
        levelUpdated[levelIndex] = data;
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
        const modes = formData.mode;
        
        // now, let's update our form, and also get the creator name from the database
        dispatchForm({ type: "values", data: formData });
        setVisibleCharts(modes && modes.length > 0 ? modes.at(-1).id : null);
    };

    // FUNCTION 14: isDuplicate - function that checks if an entity attempting to be added is already present in data
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

    // FUNCTION 15: handleCategoryInsert - function that is called when the user adds a new category select row
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

    // FUNCTION 16: handleCategoryUpdate - function that is called when the user updates an existing category row
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

    // FUNCTION 17: handleModeInsert - function that is called when the user wants to add a new mode to the list of modes
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
        setVisibleCharts(id);
    }

    // FUNCTION 18: handleModeUpdate - code that is excuted each time the user makes a keystroke in a mode input
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

    // FUNCTION 19: handleModeDelete - code that is executed when the user decides to delete a mode
    // PRECONDITIONS (1 parameter):
    // 1.) id: an integer representing the id of the mode the user wants to delete
    // POSTCONDITIONS (1 possible outcome):
    // the system will attempt to delete the mode
    const handleModeDelete = id => {
        if (visibleCharts === id) {
            setVisibleCharts(null);
        }
        dispatchForm({ type: dispatchTypes.DELETE_MODE.name, data: id });
    }

    // FUNCTION 20: handleLevelInsert - function that is called when the user wants to add a new level to the list of levels
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

        const isPracticeMode = appData.categories[category].practice;
        const data = {
            ...chartDefaults,
            category,
            mode,
            id: id,
            ascending: isPracticeMode ? null : chartDefaults.ascending
        };
        dispatchForm({ type: dispatchTypes.INSERT_LEVEL.name, data });
    };

    // FUNCTION 21: handleLevelChange - code that is executed when the use modifies any of the level inputs
    // PRECONDITIONS (1 parameter):
    // 1.) level: a level object
    // POSTCONDITIONS (1 possible outcome):
    // the level is updated to take the value of the parameter
    const handleLevelChange = level => dispatchForm({ type: dispatchTypes.UPDATE_LEVEL.name, data: level });

    // FUNCTION 22: handleLevelDelete - code that is executed when the user decides to delete a level
    // PRECONDITIONS (1 parameter):
    // 1.) id: an integer representing the id of the level the user wants to delete
    // POSTCONDITIONS (1 possible outcome):
    // the system will attempt to delete the level
    const handleLevelDelete = id => dispatchForm({ type: dispatchTypes.DELETE_LEVEL.name, data: id });

    // FUNCTION 23: validate - function that ensures the the user-inputted game structure is valid
    // PRECONDITIONS (1 parameter):
    // 1.) e: the event object generated by the submit event on the game structure form
    // POSTCONDITIONS (2 possible outcomes):
    // if the form validates successfully, unlock the next page, and update local storage
    // if the form fails to validate, update the form state to display errors
    const validate = e => {
        e.preventDefault();

        // if no errors are detected, unlock next page, and update local storage
        const error = validateStructure(form.values);
        if (!Object.values(error).some(e => e !== undefined)) {
            unlockNextPage();
        } else {
            addMessage("Form not validated, please check error messages.", "error", 8000);
        }

        dispatchForm({ type: "error", data: error });
    };

    // FUNCTION 24: openCategoryPopup - function that is called when the user wishes to open the `CategoryAddForm`
    // PRECONDITIONS: NONE
    // POSTCONDITIONS (1 possible outcome):
    // the `openState.addCategory` state is updated to "true", rendering the popup
    const openCategoryPopup = () => setPopup({ ...popup, addCategory: true });

    // FUNCTION 25: closeCategoryPopup - function that is called when the user wishes to close the `CategoryAddForm`
    // PRECONDITIONS: NONE
    // POSTCONDITIONS (1 possible outcome):
    // the `openState.addCategory` state is updated to "false", unrendering the popup
    const closeCategoryPopup = () => setPopup({ ...popup, addCategory: false });

    // FUNCTION 26: openGoalPopup - function that is called when the user wishes to open the `GoalAddForm`
    // PRECONDITIONS: NONE
    // POSTCONDITIONS (1 possible outcome):
    // the `openState.addGoal` state is updated to "true", rendering the popup
    const openGoalPopup = () => setPopup({ ...popup, addGoal: true });

    // FUNCTION 27: closeGoalPopup - function that is called when the user wishes to close the `GoalAddForm`
    // PRECONDITIONS: NONE
    // POSTCONDITIONS (1 possible outcome):
    // the `openState.addGoal` state is updated to "false", unrendering the popup
    const closeGoalPopup = () => setPopup({ ...popup, addGoal: false });

    // FUNCTION 28: handleChartDefaultsChange - function that is called when user makes changes to the chart defaults form
    // PRECONDITIONS (1 parameter):
    // 1.) e: the event object generated by the change to the input
    // POSTCONDITIONS (1 possible outcome):
    // the `chartDefaults` state is updated based on the id and value from within `e.target`
    const handleChartDefaultsChange = e => {
        let { checked, id, value } = e.target;

        // special case: if id is name, convert to backend format
        if (id === "name") {
            value = levelF2B(value);
        }

        // special case: if an "ascending" input, we need to convert value and id, since we are mapping
        // two inputs to a single value
        if (id.startsWith("ascending")) {
            value = getAscendingValue(id.split("_")[1], checked, chartDefaults.ascending);
            id = "ascending";
        }

        setChartDefaults({ ...chartDefaults, [id]: value });
    };

    return { 
        form, 
        popup,
        visibleCharts,
        setVisibleCharts,
        updateLocal, 
        populateForm, 
        handleCategoryInsert, 
        handleCategoryUpdate,
        handleModeInsert,
        handleModeUpdate,
        handleModeDelete,
        handleLevelInsert,
        handleLevelChange,
        handleLevelDelete,
        validate,
        openCategoryPopup,
        closeCategoryPopup,
        openGoalPopup,
        closeGoalPopup,
        handleChartDefaultsChange,
    };
};

/* ===== EXPORTS ===== */
export default StructureForm;