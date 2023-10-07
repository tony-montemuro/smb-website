/* ===== IMPORTS ===== */
import { MessageContext, UserContext } from "../../../utils/Contexts";
import { discordPattern, usernamePattern, twitchUsernamePattern, twitterHandlePattern, youtubeHandlePattern } from "../../../utils/RegexPatterns";
import { useContext, useReducer } from "react";
import ProfileUpdate from "../../../database/update/ProfileUpdate";
import ValidationHelper from "../../../helper/ValidationHelper";

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
        countries: [],
        error: { 
            username: undefined, 
            youtube_handle: undefined, 
            twitch_username: undefined,
            twitter_handle: undefined,
            discord: undefined, 
            featured_video: undefined, 
            video_description: undefined
        },
        uploading: false,
        user: null
    });

    /* ===== FUNCTIONS ===== */

    // database functions
    const { upsertUserInfo } = ProfileUpdate();

    // helper functions
    const { validateVideoUrl } = ValidationHelper();

     // FUNCTION 1: generateFormVals - generate an object representing the form values
    // PRECONDITIONS (2 parameters):
    // 1.) userInfo - an profile object, which will be undefined if the user has not yet set up their profile
    // 2.) userId - a string representing the id of the current user
    // POSTCONDITIONS (1 parameter):
    // 1.) formObj - an object generated to take the data from userInfo and make it "form friendly"
    const generateFormVals = (userInfo, userId) => {
        if (userInfo) {
            return {
                id: userInfo.id,
                user_id: userId,
                username: userInfo.username,
                bio: userInfo.bio ? userInfo.bio : "",
                birthday: userInfo.birthday,
                country: userInfo.country ? userInfo.country.iso2 : "",
                youtube_handle: userInfo.youtube_handle ? userInfo.youtube_handle : "",
                twitch_username: userInfo.twitch_username ? userInfo.twitch_username : "",
                twitter_handle: userInfo.twitter_handle ? userInfo.twitter_handle : "",
                discord: userInfo.discord ? userInfo.discord : "",
                featured_video: userInfo.featured_video ? userInfo.featured_video : "",
                video_description: userInfo.video_description ? userInfo.video_description : ""
            };
        } else {
            return {
                id: "",
                user_id: userId,
                username: "",
                bio: "",
                birthday: null,
                country: "",
                youtube_handle: "",
                twitch_username: "",
                twitter_handle: "",
                discord: "",
                featured_video: "",
                video_description: ""
            };
        }
    };

    // FUNCTION 2: initForm - function that is called when the component first mounts that sets the user form
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

    // FUNCTION 3: handleChange - handle a change to the form
    // PRECONDITIONS (1 parameter):
    // 1.) e: an event object that is generated when the user makes a change to any of the user form fields
    // POSTCONDITIONS (1 possible outcome): 
    // the form fields corresponding field in the form state will be updated
    const handleChange = e => {
        const { id, value } = e.target;
        dispatchForm({ field: "user", value: { [id]: value } });
    };

    // FUNCTION 4: handleBirthdayChange - handle a change to the birthday field in the user info form
    // PRECONDITIONS (1 parameter):
    // 1.) e: an event object that is generated when the user makes a change to the birthday field of the user form fields
    // POSTCONDITIONS (1 possible outcome):
    // the birthday field is updated using the date the user selected by the date picker
    const handleBirthdayChange = e => {
        let birthday = null;
        if (e) {
            let { $d: date } = e;
            const year = date.getFullYear();
            const month = String(date.getMonth()+1).padStart(2, "0");
            const day = String(date.getDate()).padStart(2, "0");
            birthday = `${ year }-${ month }-${ day }`;
        }
        console.log(birthday);
        dispatchForm({ field: "user", value: { birthday } });
    };

    // FUNCTION 5: validateUsername - determine if user has entered a valid username
    // PRECONDITIONS (1 parameter):
    // 1.) username: a string that the user has made for their username
    // POSTCONDITIONS (1 returns):
    // 1.) error: a string that gives information as to why their username is problematic, if there is any problems.
    // if this string returns undefined, it means no errors were detected
    const validateUsername = username => {
        if (!usernamePattern.test(username)) {
            return "Username must begin with an alphanumeric character, and then consist of only letters, numbers, and/or underscores.";
        }
        return undefined;
    };

    // FUNCTION 6: validateYoutubeHandle - determine if user has entered a valid youtube handle
    // PRECONDITIONS (1 parameter):
    // 1.) handle: a string representing the youtube handle the user has entered
    // POSTCONDITIONS (1 returns):
    // 1.) error: a string that gives information as to why their youtube handle is problematic, if there is any problems.
    // if this value returns undefined, it means no errors were detected
    const validateYoutubeHandle = handle => {
        if (handle && !youtubeHandlePattern.test(handle)) {
            return "YouTube Handle is not properly formatted. Remember to begin handle with '@' sign.";
        }
        return undefined;
    };

    // FUNCTION 7: validateTwitchUsername - determine if user has entered a valid twitch username
    // PRECONDITIONS (1 parameter):
    // 1.) username: a string representing the twitch username the user has entered
    // POSTCONDITIONS (1 returns):
    // 1.) error: a string that gives information as to why their twitch username is problematic, if there is any problems.
    // if this value returns undefined, it means no errors were detected
    const validateTwitchUsername = username => {
        if (username && !twitchUsernamePattern.test(username)) {
            return "Twitch username is not properly formatted.";
        }
        return undefined;
    };

    // FUNCTION 8: validateTwitterHandle - determine if user has entered a valid twitter handle
    // PRECONDITIONS (1 parameter):
    // 1.) handle: a string representing the twitter username the user has entered
    // POSTCONDITIONS (1 returns):
    // 1.) error: a string that gives information as to why their twitter handle is problematic, if there is any problems.
    // if this value returns undefined, it means no errors were detected
    const validateTwitterHandle = handle => {
        if (handle && !twitterHandlePattern.test(handle)) {
            return "X (Twitter) Handle is not properly formatted. Remember to begin handle with '@' sign.";
        }
        return undefined;
    };

    // FUNCTION 9: validateDiscord - determine if user has entered a valid discord username
    // PRECONDITIONS (1 parameter):
    // 1.) discord: a string that the user has entered for their discord username
    // POSTCONDITIONS (1 returns):
    // 1.) error: a string that gives information as to why their discord username is problematic, if there is any problems.
    // if this string returns undefined, it means no errors were detected
    const validateDiscord = discord => {
        if (discord && !discordPattern.test(discord)) {
            return "Discord username is not properly formatted.";
        }
        return undefined;
    };

    // FUNCTION 10: validateFeaturedVideo - determine if the featured video has a valid format
    // PRECONDITIONS (1 parameter):
    // 1.) featuredVideo: a string that the user has entered for their featured video
    // POSTCONDITIONS (1 returns):
    // 1.) error: a string that gives information as to why their video URL is problematic, if there is any problems.
    // if this string returns undefined, it means no errors were detected
    const validateFeaturedVideo = featuredVideo => {
        return featuredVideo ? validateVideoUrl(featuredVideo) : undefined;
    };

    // FUNCTION 11: validateVideoDescription - determine if the video description has a valid format
    // PRECONDITIONS (2 parameters):
    // 1.) description: a string that the user has entered for their video description
    // 2.) featuredVideo: a string that the user has entered for their featured video
    // POSTCONDITIONS (1 returns):
    // 1.) error: a string that gives information as to why their video URL is problematic, if there is any problems.
    // if this string returns undefined, it means no errors were detected
    const validateVideoDescription = (description, featuredVideo) => {
        if (description && !featuredVideo) {
            return "Featured Video is required to fill out this field. Either leave this field blank, or provide a Featured video.";
        }
        return undefined;
    };

    // FUNCTION 12: uploadUserInfo - function that validates, processes, & uploads the form containing the user info (upsert)
    // PRECONDITIONS (1 parameter):
    // 1.) e: an event object that is generated when the user submits the form
    // POSTCONDITIONS (3 possible outcomes): 
    // if the form fails to validate, we update the error field of the user form with any validation errors,
    // and return from the function early
    // if the user form is validated, we update the user's profile in the database
    // if the user form is validated, but the database update fails, we render an error to the user, and return
    const uploadUserInfo = async (e) => {
        // create error object to track form errors
        e.preventDefault();
        const error = {};
        Object.keys(form.error).forEach(field => error[field] = undefined);

        // validate form fields
        error.username = validateUsername(form.user.username);
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
            if (!user.profile) {
                delete userInfo.id; // user's with no profile yet have no id yet
            }

            // attempt to upload user info. if it's a success, we also update user state, and render a success message
            await upsertUserInfo(userInfo);
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
        };
    };

    return { 
        form,
        initForm,
        handleChange,
        handleBirthdayChange,
        uploadUserInfo
    };
};

/* ===== EXPORTS ===== */
export default UserInfoForm;