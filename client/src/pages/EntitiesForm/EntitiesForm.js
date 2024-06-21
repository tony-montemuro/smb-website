/* ===== IMPORTS ===== */
import { useContext, useReducer } from "react";
import { GameAddContext, MessageContext } from "../../utils/Contexts";
import Read from "../../database/read/Read.js";

const EntitiesForm = (setSelectData) => {
    /* ===== CONTEXTS ===== */

    // add message function from message context
    const { addMessage } = useContext(MessageContext);

    // keys object from game add context
    const { keys } = useContext(GameAddContext);

    /* ===== VARIABLES ===== */
    const defaultVals = {
        monkey: [],
        platform: [],
        region: [],
        rule: []
    };
    const formInit = {
        values: defaultVals,
        error: {}
    };
    const metadataKey = keys.metadata;
    const entitiesKey = keys.entities;
    const metadata = JSON.parse(localStorage.getItem(metadataKey));
    const abb = metadata.abb;

    /* ===== FUNCTIONS ===== */

    // FUNCTION 1: updateLocal - function that runs each time the user finishes interacting with a form field
    // PRECONDITIONS (1 parameter):
    // 1.) formData (optional): optional parameter. typically, we just use `form.values`, but we can also manually pass in data
    // POSTCONDITIONS (1 possible outcome):
    // the form data stored locally is updated with the current state of `form.values`
    const updateLocal = (formData = null) => {
        localStorage.setItem(entitiesKey, JSON.stringify(formData ?? form.values));
    };

    // FUNCTION 2: reducer - function that executes each time the user attempts to update the from reducer hook
    // PRECONDITIONS (2 parameters):
    // 1.) state: the state of the form object when the function is called
    // 2.) action: an object with two fields:
        // a.) field: specifies which field of the form the reducer should modify
        // b.) data: specifies the new value that the reducer should use to modify form[field]
        // c.) name: specifies the name of the entity we are currently interacting with
    // POSTCONDITIONS (4 possible outcomes):
    // if the type field is `insertValues`, we add new value to the `name` array, and update our values object
    // if the type is `updateValues`, we update the value already current to the `name` array, and update our values object
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

    // FUNCTION 3: fetchSelectData - function that grabs all the data we need for the select elements in the form
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

    // FUNCTION 4: handleInsert - function that is called when the user adds a new select row
    // PRECONDITIONS (3 parameters):
    // 1.) e: the event object generated when the user makes a change to the selector
    // 2.) id: an integer representing the id of the new entity - should be equal to the number of entities currently present
    // 3.) entityName: a string that contains the name of the entity we are modifying 
    // POSTCONDITIONS (2 possible outcome):
    // if the user selected a non-empty value, the new entity is formed, and the form data is updated to include the new
    // entity
    // if the user selected an empty value, this function will ignore the change and do nothing
    const handleInsert = (e, id, entityName) => {
        const value = e.target.value;

        if (value) {
            dispatchForm({ type: "insertValues", data: { id, [entityName]: parseInt(value) }, name: entityName });
        }
    };

    // FUNCTION 5: handleUpdate - function that is called when the user updateds an existing row
    // PRECONDITIONS (3 parameters):
    // 1.) e: the event object generated when the user makes a change to the selector
    // 2.) id: an integer representing the id of the new entity - should be equal to the number of entities currently present
    // 3.) entityName: a string that contains the name of the entity we are modifying 
    // POSTCONDITIONS (2 possible outcomes):
    // if the user select a non-empty value, the entity will be updated
    // otherwise, the system will delete the entity
    const handleUpdate = (e, id, entityName) => {
        const value = e.target.value;
    dispatchForm({ type: "updateValues", data: { id, [entityName]: value ? parseInt(value) : value }, name: entityName });
    }

    return { form, fetchSelectData, handleInsert, handleUpdate };
};

/* ===== EXPORTS ===== */
export default EntitiesForm;