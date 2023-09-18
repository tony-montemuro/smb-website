/* ===== IMPORTS ===== */
import { MessageContext, UserContext } from "../../utils/Contexts";
import { useContext, useReducer } from "react";
import ProfileUtils from "./ProfileUtils.js";
import ProfileUpdate from "../../database/update/ProfileUpdate";

const UserInfoForm = () => {
    /* ===== CONTEXTS ===== */

    // user state and update user function from user context
    const { user, updateUser } = useContext(UserContext);

    // add message function from message context
    const { addMessage } = useContext(MessageContext);

    /* ===== REDUCERS ===== */
    const [form, dispatchForm] = useReducer((state, action) => {
        if (action.field === "user" || action.field === "error") {
            return {
                ...state,
                [action.field]: {
                    ...state[action.field],
                    ...action.value
                }
            };
        } else {
            return { ...state, [action.field]: action.value };
        }
    }, {
        user: null,
        uploading: false,
        error: { 
            username: undefined, 
            bio: undefined,
            youtube_handle: undefined, 
            twitch_username: undefined,
            twitter_handle: undefined,
            discord: undefined, 
            featured_video: undefined, 
            video_description: undefined
        },
        countries: []
    });

    /* ===== FUNCTIONS ===== */

    // helper functions
    const { 
        generateFormVals, 
        validateUsername, 
        validateBio, 
        validateYoutubeHandle,
        validateTwitchUsername,
        validateTwitterHandle,
        validateDiscord, 
        validateFeaturedVideo,
        validateVideoDescription,
    } = ProfileUtils();
    const { upsertUserInfo } = ProfileUpdate();

    // FUNCTION 1: initForm - function that is called when the component first mounts that sets the user form
    // PRECONDITIONS (1 parameter):
    // 1.) countries: an array of country objects, which we will use in the user form for selecting a country
    // POSTCONDITIONS (2 possible outcome):
    // if the current user has a profile, simply fill the form states with their information from the user object.
    // otherwise, the form will be initialized with default data
    const initForm = countries => {
        // we have two cases: user has set up a profile, or is a first time user
        const userId = user.id;
        const profile = user.profile;
        dispatchForm({ field: "user", value: generateFormVals(profile, userId) });

        // finally, let's update user form with countries data
        dispatchForm({ field: "countries", value: countries });
    };

    // FUNCTION 2: handleChange - handle a change to the form
    // PRECONDITIONS (1 parameter):
    // 1.) e: an event object that is generated when the user makes a change to any of the user form fields
    // POSTCONDITIONS (1 possible outcome): 
    // the form fields corresponding field in the form state will be updated
    const handleChange = e => {
        const { id, value } = e.target;
        dispatchForm({ field: "user", value: { [id]: value } });
    };

    // FUNCTION 3: uploadUserInfo - function that validates, processes, & uploads the form containing the user info (upsert)
    // PRECONDITIONS (1 parameter):
    // 1.) e: an event object that is generated when the user submits the form
    // POSTCONDITIONS (2 possible outcomes): 
    // if the user form is validated, we update the user's profile in the database, and reload the page.
    // if the form fails to validate, we update the error field of the user form with any validation errors,
    // and return from the function early
    const uploadUserInfo = async (e) => {
        // initialize update
        e.preventDefault();

        // create error object to track form errors
        const error = {};
        Object.keys(form.error).forEach(field => error[field] = undefined);

        // validate form fields
        error.username = validateUsername(form.user.username);
        error.bio = validateBio(form.user.bio);
        error.youtube_handle = validateYoutubeHandle(form.user.youtube_handle);
        error.twitch_username = validateTwitchUsername(form.user.twitch_username);
        error.twitter_handle = validateTwitterHandle(form.user.twitter_handle);
        error.discord = validateDiscord(form.user.discord);
        error.featured_video = validateFeaturedVideo(form.user.featured_video);
        error.video_description = validateVideoDescription(form.user.video_description, form.user.featured_video);

        // if any errors are determined, let's return
        dispatchForm({ field: "error", value: error });
        if (Object.values(error).some(e => e !== undefined)) {
            addMessage("One or more form fields had errors.", "error");
            return;
        }

        // if we made it this far, no errors were deteched, so we can go ahead and update the user profile
        try {
            // set the uploading flag to true, fix form info for upload
            dispatchForm({ field: "uploading", value: true });
            const userInfo = { ...form.user };
            userInfo.birthday = userInfo.birthday.length > 0 ? userInfo.birthday : null;
            userInfo.country = userInfo.country !== "" ? userInfo.country : null;

            // special case: user has not set up profile. in this case, we want to remove the id field entirely from the userInfo
            // object, since the user has not been assigned an id yet. they will get one once their profile is created
            if (!user.profile) {
                delete userInfo.id;
            }

            // attempt to upload user info
            await upsertUserInfo(userInfo);

            // if successful, update the user state, and render a success message
            await updateUser(user.id);
            addMessage("Profile information has successfully updated!", "success");

        } catch (error) {
            // special case: user attempted to update their username to a non-unique name
            if (error.code === "23505") {
                addMessage("This username is already taken.", "error");
                error.username = "Username must be unique.";
                dispatchForm({ field: "error", value: error });
            } 
            
            // general case: render an error message, and reset the uploading flag
            else {
                addMessage("There was an error updating your profile. Please try again.", "error");
            }
        } finally {
            dispatchForm({ field: "uploading", value: false });
        }
    };

    return { 
        form,
        initForm,
        handleChange,
        uploadUserInfo
    };
};

/* ===== EXPORTS ===== */
export default UserInfoForm;