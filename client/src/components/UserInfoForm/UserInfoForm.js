/* ===== IMPORTS ===== */
import { MessageContext, PopupContext, UserContext } from "../../utils/Contexts.js";
import { discordPattern, usernamePattern, twitchUsernamePattern, twitterHandlePattern, youtubeHandlePattern } from "../../utils/RegexPatterns";
import { useContext, useReducer } from "react";
import CountriesRead from "../../database/read/CountriesRead.js";
import ProfileUpdate from "../../database/update/ProfileUpdate.js";
import ValidationHelper from "../../helper/ValidationHelper.js";

const UserInfoForm = (setSubmitting, adminMode) => {
    /* ===== VARIABLES ===== */
    const defaultForm = {
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
        user: null
    };

    /* ===== CONTEXTS ===== */

    // add message function from message context
    const { addMessage } = useContext(MessageContext);

    // generally, `closePopup` will be an empty function
    // however, if we are in admin mode, we are accessing this component within a popup, so we can
    // define `closePopup` as the closePopup function from the popup context
    const popupContext = useContext(PopupContext);
    let closePopup = adminMode.status ? popupContext.closePopup : () => {};

    // generally, we will assign user to user state from user context
    // however, if we are in admin mode, we want to ignore the current user's context
    let { user, updateUser } = useContext(UserContext);
    if (adminMode.status) {
        user = null;
    }

    /* ===== REDUCERS ===== */

    // REDUCER FUNCTION: code that executes when the `dispatchForm` function is called
    // PRECONDITIONS (2 parameters):
    // 1.) state: represents the current state of `form`
    // 2.) action: represents the payload passed by the dispatcher function, which should be an object containing two fields
        // a.) field: this essentially determines how this function behaves, should be either "section", "user", "error",
        // or "countries"
        // b.) value: the new value we want to update the form to
    // POSTCONDITIONS (3 possible outcomes):
    // 1.) if the field is `user` or `error`, we update an individual, or the entire, user / error state
    // 2.) if the field is `countries`, we update the entire countries state
    // 3.) otherwise, this function does nothing (return state)
    const reducer = (state, action) => {
        const field = action.field, value = action.value;
        if (field === "user" || field === "error") {
            return { ...state, [field]: { ...state[field], ...value } };
        }
        if (field === "countries") {
            return { ...state, [field]: value };
        }
        return state;
    };
    const [form, dispatchForm] = useReducer(reducer, defaultForm);

    /* ===== FUNCTIONS ===== */

    // database functions
    const { queryCountries } = CountriesRead();
    const { upsertUserInfo, insertUserInfo } = ProfileUpdate();

    // helper functions
    const { validateVideoUrl } = ValidationHelper();

    // FUNCTION 1: generateFormVals - generate an object representing the form values
    // PRECONDITIONS: NONE
    // POSTCONDITIONS (2 possible outcomes):
    // if the profile object is defined, return a form object that matches the data found in the profile object
    // otherwise, return the default form state, which is filled with empty values
    const generateFormVals = () => {
        // extract values from user object, which is typically defined, unless in admin mode
        const userId = user?.id;
        const profile = user?.profile;

        if (profile) {
            return {
                id: profile.id,
                user_id: userId,
                username: profile.username,
                bio: profile.bio ? profile.bio : "",
                birthday: profile.birthday,
                country: profile.country ? profile.country.iso2 : "",
                youtube_handle: profile.youtube_handle ? profile.youtube_handle : "",
                twitch_username: profile.twitch_username ? profile.twitch_username : "",
                twitter_handle: profile.twitter_handle ? profile.twitter_handle : "",
                discord: profile.discord ? profile.discord : "",
                featured_video: profile.featured_video ? profile.featured_video : "",
                video_description: profile.video_description ? profile.video_description : ""
            };
        } else {
            return {
                id: "",
                user_id: userId ?? null, // userId should be defined, unless in admin mode
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
    // PRECONDITIONS: NONE
    // POSTCONDITIONS (2 possible outcome):
    // generally speaking, this function should sucessfully update the form state
    // however, a rare case occurs when countries query fails. in this case, countries will remain an empty array, making
    // the countries select unusable. function will render error message to user
    const initForm = async () => {
        // we have two cases: user has set up a profile, or is a first time user
        dispatchForm({ field: "user", value: generateFormVals() });
        try {
            const countries = await queryCountries();

            // finally, let's update user form with countries data
            dispatchForm({ field: "countries", value: countries });

        } catch (error) {
            addMessage("There was an issue fetching country data, so you are unable to select a country. Refresh the page to try again.", "error", 9000);
        }
    };

    // FUNCTION 3: handleChange - handle a change to the form
    // PRECONDITIONS (1 parameter):
    // 1.) e: an event object that is generated when the user makes a change to any of the user form fields
    // POSTCONDITIONS (1 possible outcome): 
    // the form fields corresponding field in the form state will be updated
    const handleChange = e => {
        const { id, value } = e.target;
        dispatchForm({ field: "user", value: { [id]: value } });
        if (Object.keys(form.error).includes(id)) {
            dispatchForm({ field: "error", value: { [id]: null } });
        }
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
        dispatchForm({ field: "user", value: { birthday } });
    };

    // FUNCTION 5: hasChanged - code that determines whether or not the user has made any changes to the entire form
    // PRECONDITIONS (1 parameter):
    // 1.) section: a string which corresponds to one of the three sections: "profile", "socials", or "featured_video"
    // note that this value also may be undefined
    // POSTCONDITIONS (2 possible outcomes):
    // if any of the relevant sections have changed according to the section parameter, this function returns true
    // otherwise, this function returns false
    const hasChanged = section => {
        // nested function that checks if the profile section has changed
        const hasProfileSectionChanged = () => {
            const profile = user?.profile;
            return profile && (
                form.user.username !== profile.username ||
                form.user.country !== (profile.country ? profile.country.iso2 : "") || 
                form.user.bio !== profile.bio ||
                form.user.birthday !== profile.birthday
            );
        };

        // nested function that checks if the socials section has changed
        const hasSocialsSectionChanged = () => {
            const profile = user?.profile;
            return profile && (
                form.user.youtube_handle !== profile.youtube_handle ||
                form.user.twitch_username !== profile.twitch_username ||
                form.user.twitter_handle !== profile.twitter_handle ||
                form.user.discord !== profile.discord
            );
        };

        // nested function that checks if the featured video section has changed
        const hasFeaturedVideoSectionChanged = () => {
            const profile = user?.profile;
            return profile && (
                form.user.featured_video !== profile.featured_video ||
                form.user.video_description !== profile.video_description 
            );
        };

        // now, depending on the section parameter, either check if one particular section has changed, or all sections
        switch (section) {
            case "profile": return hasProfileSectionChanged();
            case "socials": return hasSocialsSectionChanged();
            case "featured_video": return hasFeaturedVideoSectionChanged();
            default: return hasProfileSectionChanged() || hasSocialsSectionChanged() || hasFeaturedVideoSectionChanged();
        };
    };

    // FUNCTION 6: handleReset - code that allows user to upload either a single section of the user form, or the entire thing
    // PRECONDITIONS (1 parameter, 1 condition):
    // 1.) section: a string which corresponds to one of the three sections: "profile", "socials", or "featured_video"
    // note that this value also may be undefined
    // NOTE: this function should ONLY be run if the user's profile is defined
    // POSTCONDITIONS (1 possible outcome):
    // the relevant fields are reset to their original values, and the form is updated
    const handleReset = section => {
        let old = generateFormVals();
        switch (section) {
            case "profile":
                old = { 
                    username: old.username, 
                    country: old.country, 
                    bio: old.bio, 
                    birthday: old.birthday 
                };
                break;
            case "socials":
                old = { 
                    youtube_handle: old.youtube_handle, 
                    twitch_username: old.twitch_username,
                    twitter_handle: old.twitter_handle,
                    discord: old.discord
                };
                break;
            case "featured_video":
                old = { 
                    featured_video: old.featured_video,
                    video_description: old.video_description
                };
                break;
            default: break;
        };
        dispatchForm({ field: "user", value: { ...old } });
    };

    // FUNCTION 7: validateUsername - determine if user has entered a valid username
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

    // FUNCTION 8: validateYoutubeHandle - determine if user has entered a valid youtube handle
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

    // FUNCTION 9: validateTwitchUsername - determine if user has entered a valid twitch username
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

    // FUNCTION 10: validateTwitterHandle - determine if user has entered a valid twitter handle
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

    // FUNCTION 11: validateDiscord - determine if user has entered a valid discord username
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

    // FUNCTION 12: validateFeaturedVideo - determine if the featured video has a valid format
    // PRECONDITIONS (1 parameter):
    // 1.) featuredVideo: a string that the user has entered for their featured video
    // POSTCONDITIONS (1 returns):
    // 1.) error: a string that gives information as to why their video URL is problematic, if there is any problems.
    // if this string returns undefined, it means no errors were detected
    const validateFeaturedVideo = featuredVideo => {
        return featuredVideo ? validateVideoUrl(featuredVideo) : undefined;
    };

    // FUNCTION 13: validateVideoDescription - determine if the video description has a valid format
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

    // FUNCTION 14: standardUpload - the typical function that actually uploads user information to database
    // PRECONDITIONS (1 parameter):
    // 1.) userInfo: an object containing user information defined in form (see `generateFormVals` function for more details)
    // POSTCONDITIONS (2 possible outcomes):
    // if the data is successfully upserted, and the user is updated successfully with new data on client, render
    // a success message
    // otherwise, this function throws an error, which should be handled by the caller function 
    const standardUpload = async userInfo => {
        try {
            await upsertUserInfo(userInfo);
            await updateUser(user.id);
            addMessage("Profile information has successfully updated!", "success", 5000);
        } catch (error) {
            throw error;
        }
    };

    // FUNCTION 15: adminUpload - function that exclusively uploads NEW profiles, accessible by admins in admin mode ONLY
    // PRECONDITIONS (1 parameter):
    // 1.) userInfo: an object containing user information defined in form (see `generateFormVals` function for more details)
    // if the data successfully uploads, render a success message, rerender the search results, and close the popup
    // otherwise, this function throws an error, which should be handled by the caller function
    const adminModeUpload = async userInfo => {
        try {
            await insertUserInfo(userInfo);
            addMessage(`Profile successfully created! Try searching for ${ userInfo.username } in the user searchbar!`);
            adminMode.refreshUserSearchFunc();
            closePopup();
        } catch (error) {
            throw error;
        }
    };

    // FUNCTION 16: uploadUserInfo - function that validates, processes, & uploads the form containing the user info (upsert)
    // PRECONDITIONS (1 parameter):
    // 1.) e: an event object that is generated when the user submits the form
    // POSTCONDITIONS (3 possible outcomes): 
    // if the form fails to validate, we update the error field of the user form with any validation errors,
    // and return from the function early
    // if the user form is validated, we update the user's profile in the database
    // if the user form is validated, but the database update fails, we render an error to the user, and return
    const uploadUserInfo = async e => {
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
            addMessage("One or more form fields had errors.", "error", 7000);
            return;
        }

        // if we made it this far, no errors were deteched, so we can go ahead and update the user profile
        try {
            setSubmitting(true);
            const userInfo = { ...form.user };
            if (!user?.profile) {
                delete userInfo.id; // user's with no profile yet have no id yet
            }
            const country = userInfo.country;
            userInfo.country = country ? country : null; 

            // attempt to upload user info. if it's a success, we also update user state, and render a success message
            if (!adminMode.status) {
                await standardUpload(userInfo);
            } else {
                await adminModeUpload(userInfo);
            }

        } catch (error) {
            // special case: user attempted to update their username to a non-unique name
            if (error.code === "23505") {
                addMessage("This username is already taken.", "error", 5000);
                error.username = "Username already taken.";
                dispatchForm({ field: "error", value: error });
            } 
            
            // general case: render an error message
            else {
                addMessage("There was an error updating your profile. Try refreshing the page.", "error", 10000);
            }

        } finally {
            setSubmitting(false);
        };
    };

    return { 
        form,
        initForm,
        handleChange,
        handleBirthdayChange,
        hasChanged,
        handleReset,
        uploadUserInfo
    };
};

/* ===== EXPORTS ===== */
export default UserInfoForm;