/* ===== IMPORTS ===== */
import { StaticCacheContext, UserContext } from "../../Contexts";
import { useContext, useReducer, useState } from "react";
import { useNavigate } from "react-router-dom";
import ProfileUtils from "./ProfileUtils.js";
import ProfilesUpdate from "../../database/update/ProfilesUpdate";
import Signout from "../../database/authentication/Signout";
import Upload from "../../database/storage/Upload";

const Profile = () => {
    /* ===== VARIABLES ===== */
    const navigate = useNavigate();

    /* ===== CONTEXTS ===== */

    // static cache state from static cache context & user state from user context 
    const { staticCache } = useContext(StaticCacheContext);
    const { user } = useContext(UserContext);

    /* ===== STATES AND REDUCERS ===== */
    const [firstTimeUser, setFirstTimeUser] = useState(false);
    const [avatarForm, dispatchAvatarForm] = useReducer((state, action) => {
        return { ...state, [action.field]: action.value };
    }, { 
        avatar_url: null,
        error: null,
        updating: false
    });
    const [userForm, dispatchUserForm] = useReducer((state, action) => {
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
        updating: false,
        error: { username: undefined, bio: undefined, discord: undefined, featured_video: undefined, video_description: undefined },
        countries: []
    });

    /* ===== FUNCTIONS ===== */

    // helper functions
    const { 
        generateFormVals, 
        validateUsername, 
        validateBio, 
        validateDiscord, 
        validateFeaturedVideo,
        validateVideoDescription,
        getFileInfo,
        validateAvatar 
    } = ProfileUtils();
    const { upsertUserInfo } = ProfilesUpdate();
    const { signOut } = Signout();
    const { uploadAvatar } = Upload();

    // FUNCTION 1: initForms - initialize both the user form and the avatar form
    // PRECONDITIONS (1 condition):
    // both the staticCache and user states should be fully updated before this function is ever called
    // POSTCONDITIONS (2 possible outcome):
    // if the current user has a profile, simply set both the avatar and user form states with their information
    // from the user object.
    // otherwise, these forms will be initialized with default data, and the setFirstTimerUser() function will be called
    // with the value true to signify that this user is new
    const initForms = () => {
        // we have two cases: user has set up a profile, or is a first time user
        const userId = user.id;
        const profile = user.profile;
        dispatchUserForm({ field: "user", value: generateFormVals(profile, userId) });
        dispatchAvatarForm({ field: "avatar_url", value: profile ? profile.avatar_url : "default.png" });

        // if user has no profile, they are a first time user. set the firstTimeUser flag to true
        if (!profile) {
            setFirstTimeUser(true);
        }

        // finally, let's update user form with countries data
        const countries = staticCache.countries;
        dispatchUserForm({ field: "countries", value: countries });
    };

    // FUNCTION 2: handleChange - handle a change to the userForm
    // PRECONDITIONS (1 parameter):
    // 1.) e: an event object that is generated when the user makes a change to any of the user form fields
    // POSTCONDITIONS (1 possible outcome): 
    // the form fields corresponding field in the userForm state will be updated
    const handleChange = e => {
        const { id, value } = e.target;
        dispatchUserForm({ field: "user", value: { [id]: value } });
        console.log(userForm);
    };

    // FUNCTION 3: updateUserInfo - function that processes a submitted userForm
    // PRECONDITIONS (1 parameter):
    // 1.) e: an event object that is generated when the user submits the form
    // POSTCONDITIONS (2 possible outcomes): 
    // if the user form is validated, we update the user's profile in the database, and reload the page.
    // if the form fails to validate, we update the error field of the user form with any validation errors,
    // and return from the function early
    const updateUserInfo = async (e) => {
        // initialize update
        const profiles = staticCache.profiles;
        e.preventDefault();
        dispatchUserForm({ field: "updating", value: true });

        // create error object to track form errors
        const error = {};
        Object.keys(userForm.error).forEach(field => error[field] = undefined);

        // validate form fields
        error.username = validateUsername(userForm.user.username, userForm.user.id, profiles);
        error.bio = validateBio(userForm.user.bio);
        error.discord = validateDiscord(userForm.user.discord);
        error.featured_video = validateFeaturedVideo(userForm.user.featured_video);
        error.video_description = validateVideoDescription(userForm.user.video_description, userForm.user.featured_video);

        // if any errors are determined, let's return
        dispatchUserForm({ field: "error", value: error });
        if (Object.values(error).some(e => e !== undefined)) {
            dispatchUserForm( { field: "updating", value: false });
            return;
        }

        // if we made it this far, no errors were deteched, so we can go ahead and update the user profile
        try {
            userForm.user.birthday = userForm.user.birthday.length > 0 ? userForm.user.birthday : null;
            await upsertUserInfo({ ...userForm.user });

            // if successful, reload the page
            window.location.reload();
        } catch (error) {
            console.log(error);
            alert(error.message);
            dispatchUserForm({ field: "updating", value: false });
        }
    };

    // FUNCTION 4: avatarSubmit - function that processes a submitted avatarForm
    // PRECONDITIONS (2 parameters):
    // 1.) e: an event object that is generated when the user submits the form
    // 2.) avatarRef: a ref hook that is assigned to the avatar input
    // POSTCONDITIONS (2 possible outcomes): 
    // if the avatar form is validated, we upload the image and update the user's profile in the database, 
    // and reload the page.
    // if the form fails to validate, we update the error field of the avatar form with the validation error,
    // and return from the function early
    const avatarSubmit = async (e, avatarRef) => {
        // initialize update
        e.preventDefault();
        dispatchAvatarForm({ field: "updating", value: true });
        const profileId = user.profile.id;

        // validate the user uploaded avatar
        const error = validateAvatar(avatarRef, firstTimeUser);

        // if there is an error, return early
        dispatchAvatarForm({ field: "error", value: error });
        if (error) {
            dispatchAvatarForm({ field: "updating", value: false });
            return;
        }

        // if we made it this far, we have no errors. let's update the backend
        const { file, fileExt } = getFileInfo(avatarRef);
        try {
            await uploadAvatar(file, `${ profileId }.${ fileExt }`);

            // if successful, reload the page
            window.location.reload();
        } catch (error) {
            console.log(error);
            alert(error.message);
            dispatchAvatarForm({ field: "updating", value: false });
        }
    };

    // FUNCTION 5: signOutUser - function that signs a user out
    // PRECONDITIONS (1 condition):
    // the application should have a currently signed-in user when this function is called
    // POSTCONDITIONS (2 possible outcomes):
    // if successful, the user will be signed out, and navigated back to the home page
    // if unsuccessful, we handle the error here
    const signOutUser = async () => {
        try {
            // attempt to sign the user out
            await signOut();

            // if successful, let's navigate back to the home page
            navigate("/");

        } catch (error) {
            console.log(error);
            alert(error.message);
        }
    };

    return { 
        userForm,
        avatarForm,
        initForms,
        handleChange,
        updateUserInfo,
        avatarSubmit,
        signOutUser
    };
};

/* ===== EXPORTS ===== */
export default Profile;