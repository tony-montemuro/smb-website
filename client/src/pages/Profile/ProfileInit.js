import { useState, useRef, useReducer } from "react";
import { supabase } from "../../database/SupabaseClient";
import { useNavigate } from "react-router-dom";
import ProfileHelper from "../../helper/ProfileHelper";
import ProfileUpdate from "../../database/update/ProfileUpdate";

const ProfileInit = () => {
    /* ===== REFS ===== */
    const avatarRef = useRef(null);

    /* ===== STATES AND REDUCERS ===== */
    const [loading, setLoading] = useState(true);
    const [firstTimeUser, setFirstTimeUser] = useState(false);
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
        error: { username: undefined, bio: undefined, discord: undefined },
        countries: []
    });
    const [avatarForm, dispatchAvatarForm] = useReducer((state, action) => {
        return { ...state, [action.field]: action.value };
    }, { 
        avatar_url: null,
        error: null,
        updating: false
    });

    /* ===== FUNCTIONS ===== */

    // helper functions
    const { 
        generateFormVals, 
        validateUsername, 
        validateBio, 
        validateDiscord, 
        getFileInfo,
        validateAvatar 
    } = ProfileHelper();
    const { upsertUserInfo, uploadAvatar } = ProfileUpdate();

    // navigate used for redirecting
    const navigate = useNavigate();

    // verify a user is accessing this page. once done, 
    const initForms = (profiles, countries, session) => {
        // first, verify a user is attempting to access this page
        if (!session) {
            console.log("Error: Invalid access.");
            navigate("/");
            return;
        }

        // now we have two cases: user has set up a profile, or is a first time user
        const userId = session.user.id;
        const userInfo = profiles.find(row => row.id === userId);
        dispatchUserForm({ field: "user", value: generateFormVals(userInfo, userId) });
        dispatchAvatarForm({ field: "avatar_url", value: userInfo ? userInfo.avatar_url : "default.png" });
        if (!userInfo) {
            setFirstTimeUser(true);
        }

        // finally, let's update user form with countries data
        dispatchUserForm({ field: "countries", value: countries });
        setLoading(false);
    };

    // function that runs each time a form value is changed. keeps user state updated
    const handleChange = (e) => {
        const { id, value } = e.target;
        dispatchUserForm({ field: "user", value: { [id]: value } });
        console.log(userForm);
    };

    // function that runs when the user submits the userInfo form
    const updateUserInfo = async (e, profiles) => {
        // initialize update
        e.preventDefault();
        dispatchUserForm({ field: "updating", value: true });

        // create error object to track form errors
        const error = {};
        Object.keys(userForm.error).forEach(field => error[field] = undefined);

        // validate form fields
        error.username = validateUsername(userForm.user.username, userForm.user.id, profiles);
        error.bio = validateBio(userForm.user.bio);
        error.discord = validateDiscord(userForm.user.discord);

        // if any errors are determined, let's return
        dispatchUserForm({ field: "error", value: error });
        if (Object.values(error).some(e => e !== undefined)) {
            dispatchUserForm( { field: "updating", value: false });
            return;
        }

        // if we made it this far, no errors were deteched, so we can go ahead and update the user profile
        await upsertUserInfo({ ...userForm.user });
        dispatchUserForm({ field: "updating", value: false });
    };

    // function that runs when the user submits the avatarForm
    const avatarSubmit = async (e, session) => {
        // initialize update
        e.preventDefault();
        dispatchAvatarForm({ field: "updating", value: true });
        const userId = session.user.id;

        // validate the user uploaded avatar
        const error = validateAvatar(avatarRef, userId, firstTimeUser);

        // if there is an error, return early
        dispatchAvatarForm({ field: "error", value: error });
        if (error) {
            dispatchAvatarForm({ field: "updating", value: false });
            return;
        }

        // if we made it this far, we have no errors. let's update the backend
        const { file, fileExt } = getFileInfo(avatarRef);
        await uploadAvatar(file, `${ userId }.${ fileExt }`);
    };

    // function that will sign the user out, and navigate them back to the home screen.
    const signOut = async () => {
        supabase.auth.signOut();
        navigate("/");
    };

    return { 
        loading,
        userForm,
        avatarForm,
        avatarRef,
        initForms,
        handleChange,
        updateUserInfo,
        avatarSubmit,
        signOut
    };
};

export default ProfileInit;