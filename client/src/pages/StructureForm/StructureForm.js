/* ===== IMPORTS ===== */
import { useContext, useReducer } from "react";
import { GameAddContext, MessageContext } from "../../utils/Contexts";
import FrontendHelper from "../../helper/FrontendHelper.js";
import Read from "../../database/read/Read.js";

const StructureForm = (setCategories) => {
    /* ===== CONTEXTS ===== */

    // keys object & unlock page function from game add context
    const { keys } = useContext(GameAddContext);

    // add message function from message context
    const { addMessage } = useContext(MessageContext);

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

    // FUNCTION 3: queryCategories - function that grabs all categories
    // PRECONDITIONS: NONE
    // POSTCONDITIONS (2 possible outcomes):
    // if the query is successful, the `categories` state is updated with the values
    // if the query is unsuccessful, an error message is rendered to the user, and the `categories` state
    // remains unset
    const queryCategories = async () => {
        try {
            const categories = await queryAll("category", "id");
            setCategories(categories);

        } catch (error) {
            addMessage("Categories could not be loaded. If refreshing the page does not work, the system may be experiencing an outage.", "error", 15000);
        };
    };

    // FUNCTION 4: isDuplicate - function that checks if an entity attempting to be added is already present in data
    // PRECONDITIONS (2 parameters):
    // 1.) data: the data the user has selected, that we wish to check
    // 2.) entityName: the string representing the set of `entityName` we want to check
    // POSTCONDITIONS (2 possible outcomes):
    // if `data` is already present in `form.values[entityName]`, return true
    // otherwise, render an error message, & return false
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

    // FUNCTION 5: handleInsert - function that is called when the user adds a new select row
    // PRECONDITIONS (3 parameters):
    // 1.) value: the value chosen by the user from the selector
    // 2.) id: an integer representing the id of the new entity - should be equal to the number of entities currently present
    // 3.) entityName: a string that contains the name of the entity we are modifying 
    // POSTCONDITIONS (2 possible outcome):
    // if the user selected a non-empty value, the new entity is formed, and the form data is updated to include the new
    // entity
    // if the user selected an empty / duplicate value, this function will ignore the change and do nothing
    const handleInsert = (value, id, entityName) => {
        console.log(value, id, entityName)
        console.log(entityName);
        const data = { id, [entityName]: parseInt(value) };
        if (value && !isDuplicate(data, entityName)) {
            dispatchForm({ type: "insertValues", data, name: entityName });
        }
    };

    // FUNCTION 6: handleUpdate - function that is called when the user updates an existing row
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

    return { form, queryCategories, handleInsert, handleUpdate };
};

/* ===== EXPORTS ===== */
export default StructureForm;