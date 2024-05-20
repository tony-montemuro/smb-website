/* ===== IMPORTS ===== */
import { GameAddContext } from "../../utils/Contexts";
import { useContext, useReducer, useState } from "react";
import FrontendHelper from "../../helper/FrontendHelper";
import ValidationHelper from "../../helper/ValidationHelper";

const MetadataForm = () => {
    /* ===== CONTEXTS ===== */

    // keys array & unlock page function from game add context
    const { keys, unlockNextPage } = useContext(GameAddContext);

    /* ===== STATES ===== */
    const [creatorName, setCreatorName] = useState("");

    /* ===== FUNCTIONS ===== */

    // helper functions
    const { dateB2F } = FrontendHelper();
    const { validateDate } = ValidationHelper();

    /* ===== VARIABLES ===== */
    const defaultVals = {
        abb: "",
        name: "",
        custom: false,
        release_date: dateB2F(),
        min_date: dateB2F(),
        creator_id: null,
        download: null,
        live_preference: true
    };
    const formInit = { 
		values: defaultVals, 
		error: { 
            abb: undefined, 
            release_date: undefined, 
            min_date: undefined, 
        }
	};
    const metadataKey = keys["metadata"];

    /* ===== REDUCER FUNCTIONS ===== */

    // FUNCTION 1: reducer - function that executes each time the user attempts to update the from reducer hook
    // PRECONDITIONS (2 parameters):
    // 1.) state: the state of the form object when the function is called
    // 2.) action: an object with two fields:
        // a.) field: specifies which field of the form the reducer should modify
        // b.) value: specifies the new value that the reducer should use to modify form[field]
    // POSTCONDITIONS (N possible outcomes):
    const reducer = (state, action) => {
        const field = action.field, value = action.value;
		switch (field) {
            case "values":
                return { ...state, values: { ...state.values, ...value } };
			case "error":
                return { ...state, error: { ...state.error, ...value } };
			default:
				return null;
		}
	};

    /* ====== REDUCERS ===== */
    const [form, dispatchForm] = useReducer(reducer, formInit);

    /* ===== FUNCTIONS ===== */

    // FUNCTION 1: populateForm - function that executes when the MetadataForm component mounts
    // PRECONDITIONS: NONE
    // POSTCONDITIONS (2 possible outcomes):
    // if the `GAME_ADD_METADATA` key is stored locally, we need to match the form with this data
    // otherwise, this function does nothing
    const populateForm = () => {
        const formData = JSON.parse(localStorage.getItem(metadataKey));
        if (formData) {
            dispatchForm({ field: "values", value: formData });
        }
    };

    // FUNCTION 2: handleChange - function that is run each time the user modifies the form
	// PRECONDITIONS (1 parameter):
	// 1.) e: an event object generated when the user makes a change to the form
	// POSTCONDITIONS (3 possible outcomes):
    // if the field is custom, and checked is false, we need to reset "custom game" fields to default values
	// if the field id is custom or live_preference, we use the checked variable rather than the value variable to update the form
	// otherwise, we simply update the form field based on the value variable
    const handleChange = e => {
        // get variables from e.target
        const { id, value, checked } = e.target;

        // special case: updating the custom field, and value is false. need to reset "custom game" fields
        if (id === "custom" && checked === false) {
            dispatchForm({ 
                field: "values", 
                value: {
                    custom: false,
                    min_date: form.values.release_date,
                    creator_id: null,
                    download: null
                }
            });
            setCreatorName("");
        }

        // special case: updating a checkbox field
        else if (["custom", "live_preference"].includes(id)) {
            dispatchForm({ field: "values", value: { [id]: checked } });
        }

        // general case: updating a "normal" field
        else {
            dispatchForm({ field: "values", value: { [id]: value } });
        }
    };

    // FUNCTION 3: handleDateChange - function specifically designed to handle date input changes
    // PRECONDITIONS (1 parameter):
    // 1.) e: an event object that is generated when the user makes a change to a date input of the form
    // 2.) field: a string containing the name of the field to update
    // POSTCONDITIONS (1 possible outcome):
    // the field is updated using the date the user selected by the date picker
    const handleDateChange = (e, id) => {
        let date = null;

        if (e && !isNaN(e.$D)) {
            let { $d: d } = e;
            const year = d.getFullYear();
            const month = String(d.getMonth()+1).padStart(2, "0");
            const day = String(d.getDate()).padStart(2, "0");
            date = `${ year }-${ month }-${ day }`;
        }

        dispatchForm({ field: "values", value: { [id]: date } });
    };

    // FUNCTION 4: updateLocal - function that runs each time the user finishes interacting with a form field
    // PRECONDITIONS: NONE
    // POSTCONDITIONS (1 possible outcome):
    // the form data stored locally is updated with the current state of `form.values`
    const updateLocal = () => {
        localStorage.setItem(metadataKey, JSON.stringify(form.values));
    };

    // FUNCTION 5: validateAbb - function that validates the abb form field
    // PRECONDITIONS (1 parameter):
    // 1.) abb: a string, which will correspond to the primary key of the new game in the database
    // POSTCONDITIONS (2 possible outcomes):
    // if the abb contains any upper-case letters, or special characters, return a string that contains the error message
    // if the abb is determined to be valid, return undefined
    const validateAbb = abb => {
        const lowerAndNumbers = /^[a-z0-9]+$/;
        if (!lowerAndNumbers.test(abb)) {
            return "Abbreviation should only contain lowercase letters, and/or numbers.";
        }
    };

    // FUNCTION 6: validateAndUpdate - function that attempts to validate form values
    // PRECONDITIONS (1 parameter):
    // 1.) e: an event object that is generated when the user submits the form
    // POSTCONDITIONS (2 possible outcomes):
    // if the form validates successfully, unlock the next page, and update local storage
    // if the form fails to validate, update the form state to display errors
    const validateAndUpdate = e => {
        e.preventDefault();
        const error = {};

        console.log(form.values);
        error.abb = validateAbb(form.values.abb);
        error.release_date = validateDate(form.values.release_date);
        if (form.values.custom) {
            error.min_date = validateDate(form.values.min_date);
        }

        // if no errors are detected, unlock next page, and update local storage
        if (!Object.values(error).some(e => e !== undefined)) {
            unlockNextPage();
            updateLocal();
        }

        dispatchForm({ field: "error", value: error });
    };

    // FUNCTION 7: onUserRowClick - function that is called when selecting a user as the game creator
    // PRECONDITIONS (1 parameter):
    // 1.) profile: a profile object, containing at least the id, username, and country fields
    // POSTCONDITIONS (2 possible outcomes):
    // if profileId is the same as the profile id in our form, do nothing
    // if profileId differs from profile id in our form, update the `creator_id` form field, & update local storage
    const onUserRowClick = profile => {
        if (profile.id !== form.values.creator_id) {
            setCreatorName(profile.username);
            dispatchForm({ field: "values", value: { creator_id: profile.id } });
            updateLocal({ target: { value: profile.id } }); // mimic an event object
        }
    };

    return { 
        form,
        creatorName,
        populateForm,
        handleChange,
        handleDateChange,
        updateLocal,
        validateAndUpdate,
        onUserRowClick
    };
};

/* ===== EXPORTS ===== */
export default MetadataForm;