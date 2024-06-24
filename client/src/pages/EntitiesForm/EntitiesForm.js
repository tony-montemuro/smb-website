/* ===== IMPORTS ===== */
import { useContext, useReducer, useState } from "react";
import { GameAddContext, MessageContext } from "../../utils/Contexts";
import Read from "../../database/read/Read.js";

const EntitiesForm = (setSelectData) => {
    /* ===== CONTEXTS ===== */

    // add message function from message context
    const { addMessage } = useContext(MessageContext);

    // keys object from game add context
    const { keys } = useContext(GameAddContext);

    /* ===== STATES ===== */
    const [addEntity, setAddEntity] = useState(false);

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

    // db functions
    const { queryAll } = Read();

    // FUNCTION 3: populateForm - function that executes when the EntitiesForm component mounts
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

    // FUNCTION 4: fetchSelectData - function that grabs all the data we need for the select elements in the form
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

    // FUNCTION 5: handleInsert - function that is called when the user adds a new select row
    // PRECONDITIONS (3 parameters):
    // 1.) e: the value chosen by the user from the selector
    // 2.) id: an integer representing the id of the new entity - should be equal to the number of entities currently present
    // 3.) entityName: a string that contains the name of the entity we are modifying 
    // POSTCONDITIONS (2 possible outcome):
    // if the user selected a non-empty value, the new entity is formed, and the form data is updated to include the new
    // entity
    // if the user selected an empty value, this function will ignore the change and do nothing
    const handleInsert = (value, id, entityName) => {
        if (value) {
            dispatchForm({ type: "insertValues", data: { id, [entityName]: parseInt(value) }, name: entityName });
        }
    };

    // FUNCTION 6: handleUpdate - function that is called when the user updateds an existing row
    // PRECONDITIONS (3 parameters):
    // 1.) e: the value chosen by the user from the selector
    // 2.) id: an integer representing the id of the new entity - should be equal to the number of entities currently present
    // 3.) entityName: a string that contains the name of the entity we are modifying 
    // POSTCONDITIONS (2 possible outcomes):
    // if the user select a non-empty value, the entity will be updated
    // otherwise, the system will delete the entity
    const handleUpdate = (value, id, entityName) => {
        dispatchForm({ type: "updateValues", data: { id, [entityName]: value ? parseInt(value) : value }, name: entityName });
    }

    // FUNCTION 7: openPopup - function that is called when the user wishes to open the `EntityAddForm`
    // PRECONDITIONS: NONE
    // POSTCONDITIONS (1 possible outcome):
    // the `addEntity` state is updated to "true", rendering the popup
    const openPopup = () => setAddEntity(true);

    // FUNCTION 10: closePopup - function that is called when the user wishes to close the `EntityAddForm`
    // PRECONDITIONS: NONE
    // POSTCONDITIONS (1 possible outcome):
    // the `addEntity` state is updated to "false", unrendering the popup
    const closePopup = () => setAddEntity(false);

    return { 
        form,
        addEntity,
        populateForm,
        fetchSelectData,
        handleInsert,
        handleUpdate, 
        openPopup,
        closePopup
    };
};

/* ===== EXPORTS ===== */
export default EntitiesForm;