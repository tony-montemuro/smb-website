/* ===== IMPORTS ===== */
import { GameAddContext, MessageContext } from "../../utils/Contexts";
import { useContext, useReducer, useState } from "react";
import FrontendHelper from "../../helper/FrontendHelper";
import ProfileRead from "../../database/read/ProfileRead.js";
import ValidationHelper from "../../helper/ValidationHelper";

const MetadataForm = () => {
    /* ===== CONTEXTS ===== */

    // keys objectg & unlock page function from game add context
    const { keys, unlockNextPage } = useContext(GameAddContext);

    // add message function from message context
    const { addMessage } = useContext(MessageContext);

    /* ===== STATES ===== */
    const [creatorName, setCreatorName] = useState("");
    const [addCreator, setAddCreator] = useState(false);
    const [triggerUserSearch, setTriggerUserSearch] = useState(false);

    /* ===== FUNCTIONS ===== */

    // database functions
    const { queryProfileByList } = ProfileRead();

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

    /* ===== FUNCTIONS ===== */

    // FUNCTION 1: updateLocal - function that runs each time the user finishes interacting with a form field
    // PRECONDITIONS (1 parameter):
    // 1.) formData (optional): optional parameter. typically, we just use `form.values`, but we can also manually pass in data
    // POSTCONDITIONS (1 possible outcome):
    // the form data stored locally is updated with the current state of `form.values`
    const updateLocal = (formData = null) => {
        localStorage.setItem(metadataKey, JSON.stringify(formData ?? form.values));
    };

    // FUNCTION 2: reducer - function that executes each time the user attempts to update the from reducer hook
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

                // special case: if we are updating the creator id, we update local storage as well with updated data
                if (value.hasOwnProperty('creator_id')) {
                    updateLocal(updatedValues);
                }

                return { ...state, values: updatedValues };
			case "error":
                return { ...state, error: { ...state.error, ...value } };
			default:
				return null;
		}
	};

    /* ====== REDUCERS ===== */
    const [form, dispatchForm] = useReducer(reducer, formInit);

    /* ===== FUNCTIONS ===== */

    // FUNCTION 3: populateForm - function that executes when the MetadataForm component mounts
    // PRECONDITIONS: NONE
    // POSTCONDITIONS (2 possible outcomes):
    // if the metadata key is stored locally, we need to match the form with this data
    // otherwise, this function does nothing
    const populateForm = async () => {
        // first, let's try to grab form data. if it does not exist, return early
        const formData = JSON.parse(localStorage.getItem(metadataKey));
        if (!formData) {
            return;
        }
        
        // now, let's update our form, and also get the creator name from the database
        dispatchForm({ field: "values", value: formData });
        const creatorId = formData.creator_id;
        if (creatorId) {
            try {
                const users = await queryProfileByList([creatorId]);
                setCreatorName(users.length > 0 ? users[0].username : "");
            } catch (error) {
                addMessage("There was a problem displaying creator's information. The system may be experiencing an outage.", "error", 8000);
            }
        }
    };

    // FUNCTION 4: handleChange - function that is run each time the user modifies the form
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

    // FUNCTION 5: handleDateChange - function specifically designed to handle date input changes
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

    // FUNCTION 6: validateAbb - function that validates the abb form field
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

    // FUNCTION 7: validateAndUpdate - function that attempts to validate form values
    // PRECONDITIONS (1 parameter):
    // 1.) e: an event object that is generated when the user submits the form
    // POSTCONDITIONS (2 possible outcomes):
    // if the form validates successfully, unlock the next page, and update local storage
    // if the form fails to validate, update the form state to display errors
    const validateAndUpdate = e => {
        e.preventDefault();
        const error = {};

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

    // FUNCTION 8: onUserRowClick - function that is called when selecting a user as the game creator
    // PRECONDITIONS (1 parameter):
    // 1.) profile: a profile object, containing at least the id, username, and country fields
    // POSTCONDITIONS (2 possible outcomes):
    // if profileId is the same as the profile id in our form, do nothing
    // if profileId differs from profile id in our form, update the `creator_id` form field, & update local storage
    const onUserRowClick = profile => {
        if (profile.id !== form.values.creator_id) {
            setCreatorName(profile.username);
            dispatchForm({ field: "values", value: { creator_id: profile.id } });
            updateLocal(); // mimic an event object
        }
    };

    // FUNCTION 9: openPopup - function that is called when the user opens the "add creator" popup
    // PRECONDITIONS: NONE
    // POSTCONDITIONS (1 possible outcome):
    // when the user attempts to open the popup, we set the `addCreator` state to `true` to render the popup
    const openPopup = () => setAddCreator(true);

    // FUNCTION 10: closePopup - function that is called when the user closes the "add creator" popup is closed
    // PRECONDITIONS: NONE
    // POSTCONDITIONS (1 possible outcome):
    // when the user attempts to close the popup, we set the `addCreator` state to `false` to unrender the popup
    const closePopup = () => setAddCreator(false);

    // FUNCTION 11: refreshUserSearch - function that is called that will refresh the user search when triggered
    // PRECONDITIONS: NONE
    // POSTCONDITIONS (1 possible outcome):
    // because the `triggerUserSearch` state is a boolean, to guarantee the user search refreshes, we just need to
    // set to opposite state (false => true; true => false)
    const refreshUserSearch = () => setTriggerUserSearch(triggerUserSearch => !triggerUserSearch);

    return { 
        form,
        creatorName,
        addCreator,
        triggerUserSearch,
        updateLocal,
        populateForm,
        handleChange,
        handleDateChange,
        validateAndUpdate,
        onUserRowClick,
        openPopup,
        closePopup,
        refreshUserSearch
    };
};

/* ===== EXPORTS ===== */
export default MetadataForm;