/* ===== IMPORTS ===== */
import { MessageContext, UserContext } from "../../utils/Contexts";
import { useContext, useReducer } from "react";
import ProfileUtils from "./ProfileUtils";
import Upload from "../../database/storage/Upload";

const AvatarInfoForm = () => {
    /* ===== VARIABLES ===== */
    const initForm = { error: null, uploading: false };

    /* ===== CONTEXTS ===== */

    // add message function from message context
    const { addMessage } = useContext(MessageContext);

    // user state from user context
    const { user } = useContext(UserContext);

    /* ===== REDUCERS ===== */
    const [form, dispatchForm] = useReducer((state, action) => {
        return { ...state, [action.field]: action.value };
    }, initForm);

    /* ===== FUNCTIONS ===== */

    // helper functions
    const { getFileInfo, validateAvatar, convertToPNG } = ProfileUtils();

    // database functions
    const { uploadAvatar } = Upload();

    // FUNCTION 1: submitAvatar - function that validates, processes, & submits an avatar
    // PRECONDITIONS (2 parameters):
    // 1.) e: an event object that is generated when the user submits the form
    // 2.) avatarRef: a ref hook that is assigned to the avatar input
    // POSTCONDITIONS (2 possible outcomes): 
    // if the avatar form is validated, we upload the image and update the user's profile in the database, 
    // and reload the page.
    // if the form fails to validate, we update the error field of the avatar form with the validation error,
    // and return from the function early
    const submitAvatar = async (e, avatarRef) => {
        // initialize update
        e.preventDefault();

        // validate the user uploaded avatar
        const error = validateAvatar(avatarRef, user.profile);

        // if there is an error, return early
        dispatchForm({ field: "error", value: error });
        if (error) {
            addMessage(error, "error");
            return;
        }

        // if we made it this far, we have no errors. let's update the backend
        const { file } = getFileInfo(avatarRef);
        const profileId = user.profile.id;
        try {
            // convert file and upload
            dispatchForm({ field: "uploading", value: true });
            const convertedFile = await convertToPNG(file);
            await uploadAvatar(convertedFile, `${ profileId }.png`);

            // if successful, reload the page
            window.location.reload();
            
        } catch (error) {
            addMessage(error.message, "error");
        }

        // before the function returns, set the uploading flag back to false
        dispatchForm({ field: "uploading", value: false });
    };

    return { form, submitAvatar };
};

/* ===== EXPORTS ===== */
export default AvatarInfoForm;