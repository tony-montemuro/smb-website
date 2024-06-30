/* ===== IMPORTS ===== */
import { useContext, useReducer, useState } from "react";
import { GameAddContext, MessageContext } from "../../utils/Contexts";
import FrontendHelper from "../../helper/FrontendHelper.js";
import Read from "../../database/read/Read.js";

const EntitiesForm = (setSelectData) => {
    /* ===== CONTEXTS ===== */

    // keys object & unlock page function from game add context
    const { keys, unlockNextPage } = useContext(GameAddContext);

    // add message function from message context
    const { addMessage } = useContext(MessageContext);

    /* ===== STATES ===== */
    const [addEntity, setAddEntity] = useState(false);

    /* ===== VARIABLES ===== */
    const defaultVals = {
        moderator: [],
        monkey: [],
        platform: [],
        region: [],
        rule: []
    };
    const formInit = {
        values: defaultVals,
        error: {
            monkey: undefined,
            platform: undefined,
            region: undefined,
            rule: undefined
        }
    };
    const entitiesKey = keys.entities;

    /* ===== FUNCTIONS ===== */

    // helper functions
    const { capitalize } = FrontendHelper();

    // FUNCTION 1: updateLocal - function that runs each time the user finishes interacting with a form field
    // PRECONDITIONS (1 parameter):
    // 1.) formData (optional): optional parameter. typically, we just use `form.values`, but we can also manually pass in data
    // POSTCONDITIONS (1 possible outcome):
    // the form data stored locally is updated with the current state of `form.values`
    const updateLocal = (formData = null) => {
        localStorage.setItem(entitiesKey, JSON.stringify(formData ?? form.values));
    };

    // FUNCTION 2: userSort - function used by `sort` function to sort array of users
    // PRECONDITIONS (2 parameters):
    // 1.) userA - first user object
    // 2.) userB - second user object
    // POSTCONDITIONS (3 possible outcomes):
    // if `userA` is alphabetically ahead of `userB`, -1 is returned
    // if `userA' is alphabetically equivalent to `userB`, 0 is returned
    // if `userA` is alphabetically after `userB', 1 is returned
    const userSort = (userA, userB) => {
        const usernameA = userA.username.toLowerCase();
        const usernameB = userB.username.toLowerCase();
        return usernameA.localeCompare(usernameB);
    };

    // FUNCTION 3: reducer - function that executes each time the user attempts to update the from reducer hook
    // PRECONDITIONS (2 parameters):
    // 1.) state: the state of the form object when the function is called
    // 2.) action: an object with two fields:
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
                if (name === "moderator") {
                    extended.sort((a, b) => userSort(a, b));
                }
                updatedValues = { ...state.values, [name]: extended };

                updateLocal(updatedValues);
                return { ...state, values: updatedValues };
            case "updateValues":
                const updated = state.values[name].filter(v => v.id !== data.id);

                // only re-introduce data if value is defined. otherwise, this function behaves as a "delete"
                if (data[name]) {
                    updated.push(data);
                    updated.sort((a, b) => a.id - b.id);
                }

                updatedValues = { ...state.values, [name]: updated };
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

    // db functions
    const { queryAll } = Read();

    // FUNCTION 4: populateForm - function that executes when the EntitiesForm component mounts
    // PRECONDITIONS: NONE
    // POSTCONDITIONS (2 possible outcomes):
    // if the metadata key is stored locally, we need to match the form with this data
    // otherwise, this function does nothing
    const populateForm = async () => {
        // first, let's try to grab form data. if it does not exist, return early
        const formData = JSON.parse(localStorage.getItem(entitiesKey));
        if (!formData) {
            return;
        }
        
        // now, let's update our form, and also get the creator name from the database
        dispatchForm({ type: "values", data: formData });
    };

    // FUNCTION 5: fetchSelectData - function that grabs all the data we need for the select elements in the form
    // PRECONDITIONS (1 condition):
    // this function should be called when the `EntitiesForm` component mounts
    // POSTCONDITIONS (2 possible outcomes):
    // if we fetch all the data successfully from the database, update the formData state
    // otherwise, render an error message to the user, and do not update the `formData` state
    const fetchSelectData = async () => {
        try {
            const [monkey, platform, region, rule] = await Promise.all(
                [
                    queryAll("monkey", "id"),
                    queryAll("platform", "id"),
                    queryAll("region", "id"),
                    queryAll("rule", "id")
                ]
            );
            setSelectData({
                monkey,
                platform,
                region,
                rule
            });

        } catch (error) {
            addMessage("Form data failed to load. If reloading the page does not work, the system may be experiencing an outage.", "error", 15000);
        }
    };

    // FUNCTION 6: isDuplicate - function that checks if an entity attempting to be added is already present in data
    // PRECONDITIONS (2 parameters):
    // 1.) data: the data the user has selected, that we wish to check
    // 2.) entityName: the string representing the set of `entityName` we want to check
    // POSTCONDITIONS (2 possible outcomes):
    // if `data` is already present in `form.values[entityName]`, return true
    // otherwise, return false
    const isDuplicate = (data, entityName) => {
        const key = entityName === "moderator" ? "id" : entityName;

        // first, let's ignore check for "remove" values. generally, this is when data[entityName] is falsy. 
        // however, for moderators, this occurs when id is falsy
        if (!data[key]) {
            return false;
        }

        // if we made it this far, we are dealing with a typical entity. return true if entity exists in `form.values[entityName]`,
        // false otherwise.
        const result = form.values[entityName].some(v => v[key] === data[key]);
        if (result) {
            addMessage(`${ capitalize(entityName) } already selected.`, "error", 5000);
        }
        return result;
    };

    // FUNCTION 7: handleInsert - function that is called when the user adds a new select row
    // PRECONDITIONS (3 parameters):
    // 1.) value: the value chosen by the user from the selector
    // 2.) id: an integer representing the id of the new entity - should be equal to the number of entities currently present
    // 3.) entityName: a string that contains the name of the entity we are modifying 
    // POSTCONDITIONS (2 possible outcome):
    // if the user selected a non-empty value, the new entity is formed, and the form data is updated to include the new
    // entity
    // if the user selected an empty / duplicate value, this function will ignore the change and do nothing
    const handleInsert = (value, id, entityName) => {
        const data = { id, [entityName]: parseInt(value) };
        if (value && !isDuplicate(data, entityName)) {
            dispatchForm({ type: "insertValues", data, name: entityName });
        }
    };

    // FUNCTION 8: handleUpdate - function that is called when the user updates an existing row
    // PRECONDITIONS (3 parameters):
    // 1.) value: the value chosen by the user from the selector
    // 2.) id: an integer representing the id of the new entity - should be equal to the number of entities currently present
    // 3.) entityName: a string that contains the name of the entity we are modifying 
    // POSTCONDITIONS (3 possible outcomes):
    // if the user selects a non-empty value, the entity will be updated
    // if the user selects a duplicate value, this function will render an error message 
    // otherwise, the system will delete the entity
    const handleUpdate = (value, id, entityName) => {
        const data = { id, [entityName]: value ? parseInt(value) : value };
        if (!isDuplicate(data, entityName)) {
            dispatchForm({ type: "updateValues", data, name: entityName });
        }
    }

    // FUNCTION 9: handleModeratorInsert - function that is called when the user adds a moderator
    // PRECONDITIONS (1 parameter):
    // 1.) user - the user object of the moderator we want to add
    // POSTCONDITIONS (2 possible outcomes):
    // if the selected user is a duplicate value, this function renders an error message
    // otherwise, the selected user is added to the list of moderators
    const handleModeratorInsert = user => {
        if (!isDuplicate(user, "moderator")) {
            dispatchForm({ type: "insertValues", data: user, name: "moderator" });
        }
    };

    // FUNCTION 10: handleModeratorDelete - function that is called when the user deletes a moderator
    // PRECONDITIONS (1 parameter):
    // 1.) id - the id of the user we wish to remove from the list of moderators
    // POSTCONDITIONS (1 possible outcome):
    // the selected user is removed from the list of moderators
    const handleModeratorDelete = id => {
        dispatchForm({ type: "updateValues", data: { id }, name: "moderator" });
    };

    // FUNCTION 11: openPopup - function that is called when the user wishes to open the `EntityAddForm`
    // PRECONDITIONS: NONE
    // POSTCONDITIONS (1 possible outcome):
    // the `addEntity` state is updated to "true", rendering the popup
    const openPopup = () => setAddEntity(true);

    // FUNCTION 12: closePopup - function that is called when the user wishes to close the `EntityAddForm`
    // PRECONDITIONS: NONE
    // POSTCONDITIONS (1 possible outcome):
    // the `addEntity` state is updated to "false", unrendering the popup
    const closePopup = () => setAddEntity(false);

    // FUNCTION 13: validateEntityList - function that ensures each entity list is non-empty
    // PRECONDTIONS (1 parameter):
    // 1.) entityName: a string containing the name of the entity list we want to validate
    // POSTCONDITIONS (2 possible outcomes):
    // if the entity list is non-empty, this function returns undefined
    // if the entity list is empty, this function returns a string containing an error message
    const validateEntityList = entityName => {
        if (form.values[entityName].length > 0) {
            return undefined;
        }

        return `Must select at least one ${ entityName }.`;
    };

    // FUNCTION 14: validateAndUpdate - function that attempts to validate form values
    // PRECONDITIONS (1 parameter):
    // 1.) e: an event object that is generated when the user submits the form
    // POSTCONDITIONS (2 possible outcomes):
    // if the form validates successfully, unlock the next page, and update local storage
    // if the form fails to validate, update the form state to display errors
    const validateAndUpdate = e => {
        e.preventDefault();
        const error = {};

        Object.keys(form.error).forEach(entityName => {
            error[entityName] = validateEntityList(entityName)
        });

        // if no errors are detected, unlock next page, and update local storage
        if (!Object.values(error).some(e => e !== undefined)) {
            unlockNextPage();
        } else {
            addMessage("Form not validated, please check error messages.", "error", 8000);
        }

        dispatchForm({ type: "error", data: error });
    };

    return { 
        form,
        addEntity,
        populateForm,
        fetchSelectData,
        handleInsert,
        handleUpdate,
        handleModeratorInsert,
        handleModeratorDelete,
        openPopup,
        closePopup,
        validateAndUpdate
    };
};

/* ===== EXPORTS ===== */
export default EntitiesForm;