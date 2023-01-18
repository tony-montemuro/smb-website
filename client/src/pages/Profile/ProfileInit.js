import { useState, useRef, useReducer } from "react";
import { supabase } from "../../database/SupabaseClient";
import { useNavigate } from "react-router-dom";
import ProfileUpdate from "../../database/update/ProfileUpdate";

const ProfileInit = () => {
    /* ===== VARIABLES ===== */
    const user = supabase.auth.user();

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
        updated: false,
        error: { username: null },
        countryList: []
    });
    const [avatarForm, dispatchAvatarForm] = useReducer((state, action) => {
        return { ...state, [action.field]: action.value };
    }, { 
        avatar_url: null,
        error: null,
        updating: false
    });

    /* ===== FUNCTIONS ===== */

    // navigate used for redirecting
    const navigate = useNavigate();
    const { upsertInfo, uploadAvatar } = ProfileUpdate();

    // verify a user is accessing this page. once done, 
    const initForms = (profiles, countries) => {
        // first, verify a user is attempting to access this page
        if (!user) {
            console.log("Error: Invalid access.");
            navigate("/");
            return;
        }

        // now we have two cases: user has set up a profile, or is a first time user
        const userId = user.id;
        const userInfo = profiles.find(row => row.id === userId);
        if (userInfo) {
            userInfo.country = userInfo.country ? userInfo.country : "";
            dispatchUserForm({ field: "user", value: {
                id: userInfo.id,
                username: userInfo.username,
                country: userInfo.country.iso2,
                youtube_url: userInfo.youtube_url,
                twitch_url: userInfo.twitch_url
            }});
            dispatchAvatarForm({ field: "avatar_url", value: userInfo.avatar_url });
        } else {
            dispatchUserForm({ field: "user", value: {
                id: userId,
                username: "",
                country: "",
                youtube_url: "",
                twitch_url: "",
            }});
            dispatchAvatarForm({ field: "avatar_url", value: "default.png" });
            setFirstTimeUser(true);
        }

        // finally, let's update user form with countries data
        dispatchUserForm({ field: "countryList", value: countries });
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
        const error = {};
        Object.keys(userForm.error).forEach(field => error[field] = null);
        const regex = new RegExp('^[A-Za-z0-9_]*$');
        const name = userForm.user.username;

        // first, test the username field
        if (!name) {
            error.username = "Error: Username is required to create a profile!";
        }
        else if (name.length < 5 || name.length > 25) {
            error.username = "Error: Username must be between 5 and 25 characters long.";
        }
        else if (!regex.test(name)) {
            error.username = "Error: Username must consist only of letters, numbers, and/or underscores.";
        }
        else if (profiles.some(row => row.username === name && row.id !== userForm.user.id)) {
            error.username = "Error: This username is already taken. Please try another username.";
        }

        // if any errors are determined, let's return
        dispatchUserForm({ field: "error", value: error });
        if (Object.values(error).some(e => e != null)) {
            dispatchUserForm( {field: "updating", value: false });
            return;
        }

        // if we made it this far, no errors were deteched, so we can go ahead and update the user profile
        await upsertInfo({ ...userForm.user });
        dispatchUserForm({ field: "updating", value: false });
    };

    // function that runs when the user submits the avatarForm
    const avatarSubmit = async (e) => {
        // initialize update
        e.preventDefault();
        dispatchAvatarForm({ field: "updating", value: true });
        let error = null;

        // initial check - make sure user has a profile. if not, reject request to update avatar
        if (firstTimeUser) {
            dispatchAvatarForm({ 
                field: "error", 
                value: "Error: Please edit your profile information before choosing an avatar."
            });
            dispatchAvatarForm({ field: "updating", value: false });
            return;
        }

        // next, we need to validate that user is uploading a valid image
        if (!avatarRef.current.files || avatarRef.current.files.length === 0) {
            dispatchAvatarForm({ 
                field: "error", 
                value: "Error: You must select an image to upload."
            });
            dispatchAvatarForm({ field: "updating", value: false });
            return;
        }

        // now, define path variables
        const userId = user.id;
        const file = avatarRef.current.files[0];
        const fileExt = file.name.split(".").pop();
        const filePath = `${ userId }.${ fileExt }`;

        // if the file selected is not a valid type, update error state
        const validExtensions = ["png", "jpg", "jpeg"];
        if (!validExtensions.includes(fileExt)) {
            error = "Error: Invalid file type.";
        }

        // if the file selected is greater than 5mb, update error state
        if (file.size > 5000000) {
            error = "Error: File size too big.";
        }

        // if there is an error, return early
        dispatchAvatarForm({ field: "error", value: error });
        if (error) {
            dispatchAvatarForm({ field: "updating", value: false });
            return;
        }

        // if we made it this far, we have no errors. let's update the backend
        await uploadAvatar(file, filePath, userId);
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
}

export default ProfileInit;