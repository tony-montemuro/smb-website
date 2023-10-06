/* ===== IMPORTS ===== */
import { MessageContext, UserContext } from "../../../utils/Contexts";
import { useContext, useReducer } from "react";
import Download from "../../../database/storage/Download";
import ProfileUtils from "../ProfileUtils";
import Upload from "../../../database/storage/Upload";

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
    const { updateImageByProfileId } = Download(); 

    // FUNCTION 1: submitAvatar - function that validates, processes, & submits an avatar
    // PRECONDITIONS (2 parameters):
    // 1.) e: an event object that is generated when the user submits the form
    // 2.) avatarRef: a ref hook that is assigned to the avatar input
    // 3.) imageReducer: an object with two fields:
        // a.) reducer: the image reducer itself (state)
        // b.) dispatchSubmissions: the reducer function used to update the reducer
    // POSTCONDITIONS (2 possible outcomes): 
    // if the avatar form is validated, we upload the image and update the user's profile in the database, 
    // and reload the page.
    // if the form fails to validate, we update the error field of the avatar form with the validation error,
    // and return from the function early
    const submitAvatar = async (e, avatarRef, imageReducer) => {
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

            // re-download the new image & update the global image state, and render a success message
            await updateImageByProfileId(user.profile.id, imageReducer, true);
            addMessage("Avatar successfully uploaded. If it is not showing up, give it some time and reload the page.", "success");
            
        } catch (error) {
            addMessage(error.message, "error");
        } finally {
            dispatchForm({ field: "uploading", value: false });
        };
    };

    return { form, submitAvatar };
};

/* ===== EXPORTS ===== */
export default AvatarInfoForm;