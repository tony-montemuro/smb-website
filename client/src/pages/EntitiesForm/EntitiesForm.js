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
        monkeys: [],
        platforms: [],
        regions: [],
        rules: []
    };
    const formInit = {
        values: defaultVals,
        error: {}
    };
    const metadataKey = keys["metadata"];
    const metadata = JSON.parse(localStorage.getItem(metadataKey));
    const abb = metadata.abb;

    /* ===== REDUCER FUNCTIONS ===== */

    // REDUCER FUNCTION 1: reducer - function that executes each time the user attempts to update the from reducer hook
    // PRECONDITIONS (2 parameters):
    // 1.) state: the state of the form object when the function is called
    // 2.) action: an object with two fields:
        // a.) field: specifies which field of the form the reducer should modify
        // b.) value: specifies the new value that the reducer should use to modify form[field]
    // POSTCONDITIONS (3 possible outcomes):
    // if the values field is updated, we update any changed values
    // if the error field is update, we update any changed errors
    // otherwise, this function does nothing 
    const reducer = (state, action) => {
        const field = action.field, value = action.value;
		switch (field) {
            case "values":
                const updatedValues = { ...state.values, ...value };
                return { ...state, values: updatedValues };
			case "error":
                return { ...state, error: { ...state.error, ...value } };
			default:
				return null;
		}
    };

    /* ===== REDUCERS ===== */
    const [form, dispatchForm] = useReducer(reducer, formInit);
    
    /* ===== FUNCTIONS ===== */

    // db functions
    const { queryAll } = Read();

    // FUNCTION 1: fetchSelectData - function that grabs all the data we need for the select elements in the form
    // PRECONDITIONS (1 condition):
    // this function should be called when the `EntitiesForm` component mounts
    // POSTCONDITIONS (2 possible outcomes):
    // if we fetch all the data successfully from the database, update the formData state
    // otherwise, render an error message to the user, and do not update the `formData` state
    const fetchSelectData = async () => {
        try {
            const [monkeys, platforms, regions, rules] = await Promise.all(
                [
                    queryAll("monkey", "id"),
                    queryAll("platform", "id"),
                    queryAll("region", "id"),
                    queryAll("rule", "id")
                ]
            );
            setSelectData({
                monkeys,
                platforms,
                regions,
                rules
            });

        } catch (error) {
            addMessage("Form data failed to load. If reloading the page does not work, the system may be experiencing an outage.", "error", 15000);
        }
    };

    // FUNCTION 2: handleInsert - function that is called when the user adds a new select row
    // PRECONDITIONS (2 parameters):
    // 1.) entityName: a string representing the name of the entity we are dealing with
    // 2.) id: an integer representing the id of the new entity - should be equal to the number of entities currently present 
    // POSTCONDITIONS (1 possible outcome):
    // the new entity is formed, and the form data is updated to include the new entity
    const handleInsert = (entityName, id) => {
        
    };

    return { form, fetchSelectData, handleInsert };
};

/* ===== EXPORTS ===== */
export default EntitiesForm;