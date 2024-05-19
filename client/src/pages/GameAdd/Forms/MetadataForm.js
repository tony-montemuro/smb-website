/* ===== IMPORTS ===== */
import { useState, useReducer } from "react";
import FrontendHelper from "../../../helper/FrontendHelper";

const MetadataForm = () => {
    /* ===== STATES ===== */
    const [creatorName, setCreatorName] = useState("");

    /* ===== FUNCTIONS ===== */

    // helper functions
    const { dateB2F } = FrontendHelper();

    /* ===== VARIABLES ===== */
    const defaultVals = {
        abb: "",
        name: "",
        custom: false,
        release_date: dateB2F(),
        min_date: dateB2F(),
        creator_id: null,
        download: null,
        live_preference: false
    };
    const formInit = { 
		values: defaultVals, 
		error: { 
            abb: null, 
            name: null, 
            custom: null, 
            release_date: null, 
            min_date: null, 
            creator_id: null, 
            download: null,
            live_preference: null
        }
	};

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

    // FUNCTION 2: handleChange - function that is run each time the user modifies the form
	// PRECONDITIONS (1 parameter):
	// 1.) e: an event object generated when the user makes a change to the form
	// POSTCONDITIONS (2 possible outcomes):
	// if the field id is custom or live_preference, we use the checked variable rather than the value variable to update the form
	// otherwise, we simply update the form field based on the value variable
    const handleChange = e => {
        // get variables from e.target
        const { id, value, checked } = e.target;

        // special case: updating a checkbox field
        if (["custom", "live_preference"].includes(id)) {
            dispatchForm({ field: "values", value: { [id]: checked } });
        }

        // special case: updating the custom field, and value is false. need to reset "custom game" fields
        else if (id === "custom" && value === false) {
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

        // general case: updating a "normal" field
        else {
            dispatchForm({ field: "values", value: { [id]: value } });
        }
    };

    // FUNCTION 3: handleDateChange - function specifically designed to handle date input changes
    const handleDateChange = e => {
        const id = e.target.id;
        let date = null;

        if (e) {
            let { $d: date } = e;
            const year = date.getFullYear();
            const month = String(date.getMonth()+1).padStart(2, "0");
            const day = String(date.getDate()).padStart(2, "0");
            date = `${ year }-${ month }-${ day }`;
        }

        dispatchForm({ field: "values", value: { [id]: date } });
    };

    // FUNCTION 4: updateLocal
    const updateLocal = () => {
        console.log("saved");
    };

    // FUNCTION 5: validateAndUpdate
    const validateAndUpdate = () => {
        console.log("validated");
        updateLocal();
    };

    // FUNCTION 6: onUserRowClick - function that is called when selecting a user as the game creator
    // PRECONDITIONS (1 parameter):
    // 1.) profile: a profile object, containing at least the id, username, and country fields
    // POSTCONDITIONS (2 possible outcomes):
    // if profileId is the same as the profile id in our form, do nothing
    // if profileId differs from profile id in our form, update the `creator_id` form field
    const onUserRowClick = profile => {
        console.log(profile);
        if (profile.id !== form.values.creator_id) {
            setCreatorName(profile.username);
            dispatchForm({ field: "values", value: { creator_id: profile.id } });
        }
    };

    return { 
        form, 
        creatorName,
        handleChange, 
        handleDateChange, 
        updateLocal, 
        validateAndUpdate,
        onUserRowClick
    };
};

/* ===== EXPORTS ===== */
export default MetadataForm;