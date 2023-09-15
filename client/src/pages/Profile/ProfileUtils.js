/* ===== IMPORTS ===== */
import { 
    discordPattern, 
    usernamePattern, 
    youtubeHandlePattern, 
    youtubePattern, 
    twitchUsernamePattern,
    twitterHandlePattern
} from "../../utils/RegexPatterns";

const ProfileUtils = () => {
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
                birthday: userInfo.birthday ? userInfo.birthday : "",
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
                birthday: "",
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

    // FUNCTION 2: validateUsername - determine if user has entered a valid username
    // PRECONDITIONS (3 parameters):
    // 1.) username: a string that the user has made for their username
    // POSTCONDITIONS (1 returns):
    // 1.) error: a string that gives information as to why their username is problematic, if there is any problems.
    // if this string returns undefined, it means no errors were detected
    const validateUsername = (username) => {
        // first, check that the username exists
        if (!username) {
            return "Username is required to create a profile!";
        }
        
        // now, check that the length of the username is valid
        if (username.length < 4 || username.length > 25) {
            return "Username must be between 4 and 25 characters long.";
        }

        // now, ensure the username is well-formatted (alphanumeric and underscores)
        if (!usernamePattern.test(username)) {
            return "Username must consist only of letters, numbers, and/or underscores.";
        }

        return undefined;
    };

    // FUNCTION 3: validateBio - determine if user has entered a valid bio
    // PRECONDITIONS (1 parameter):
    // 1.) bio: a string that the user has made for their bio
    // POSTCONDITIONS (1 returns):
    // 1.) error: a string that gives information as to why their bio is problematic, if there is any problems.
    // if this string returns undefined, it means no errors were detected
    const validateBio = bio => {
        // check that the bio is within the character limit of 200 characters
        if (bio.length > 200) {
            return "About Me section must be 200 characters or less.";
        }

        return undefined;
    };

    // FUNCTION 4: validateYoutubeHandle - determine if user has entered a valid youtube handle
    // PRECONDITIONS (1 parameter):
    // 1.) handle: a string representing the youtube handle the user has entered
    // POSTCONDITIONS (1 returns):
    // 1.) error: a string that gives information as to why their youtube handle is problematic, if there is any problems.
    // if this value returns undefined, it means no errors were detected
    const validateYoutubeHandle = handle => {
        // ensure that the handle is well-formatted
        if (handle.length > 0 && !youtubeHandlePattern.test(handle)) {
            return "YouTube handle is not properly formatted.";
        }

        return undefined;
    };

    // FUNCTION 5: validateTwitchUsername - determine if user has entered a valid twitch username
    // PRECONDITIONS (1 parameter):
    // 1.) username: a string representing the twitch username the user has entered
    // POSTCONDITIONS (1 returns):
    // 1.) error: a string that gives information as to why their twitch username is problematic, if there is any problems.
    // if this value returns undefined, it means no errors were detected
    const validateTwitchUsername = username => {
        // ensure that the username is well-formatted
        if (username.length > 0 && !twitchUsernamePattern.test(username)) {
            return "Twitch username is not properly formatted.";
        }

        return undefined;
    };

    // FUNCTION 6: validateTwitterHandle - determine if user has entered a valid twitter handle
    // PRECONDITIONS (1 parameter):
    // 1.) handle: a string representing the twitter username the user has entered
    // POSTCONDITIONS (1 returns):
    // 1.) error: a string that gives information as to why their twitter handle is problematic, if there is any problems.
    // if this value returns undefined, it means no errors were detected
    const validateTwitterHandle = handle => {
        if (handle.length > 0 && !twitterHandlePattern.test(handle)) {
            return "Twitter handle is not properly formatted.";
        }

        return undefined;
    };

    // FUNCTION 7: validateDiscord - determine if user has entered a valid discord username
    // PRECONDITINOS (1 parameter):
    // 1.) discord: a string that the user has entered for their discord username
    // POSTCONDITIONS (1 returns):
    // 1.) error: a string that gives information as to why their discord username is problematic, if there is any problems.
    // if this string returns undefined, it means no errors were detected
    const validateDiscord = discord => {
        // ensure the string conforms to the formatted expressed in the regex expression
        if (discord && !discordPattern.test(discord)) {
            return "Discord username is not properly formatted.";
        }

        return undefined;
    };

    // FUNCTION 8: validateFeaturedVideo - determine if the featured video has a valid format
    // PRECONDITIONS (1 parameter):
    // 1.) featuredVideo: a string that the user has entered for their featured video
    // POSTCONDITIONS (1 returns):
    // 1.) error: a string that gives information as to why their video URL is problematic, if there is any problems.
    // if this string returns undefined, it means no errors were detected
    const validateFeaturedVideo = featuredVideo => {
        // ensure the string, if it exists, conforms to the formatted expressed in the regex expression
        if (featuredVideo && !youtubePattern.test(featuredVideo)) {
            return "Video URL is not properly formatted. Please make sure it is a YouTube video.";
        }

        return undefined;
    };

    // FUNCTION 9: validateVideoDescription - determine if the video description has a valid format
    // PRECONDITIONS (2 parameters):
    // 1.) description: a string that the user has entered for their video description
    // 2.) featuredVideo: a string that the user has entered for their featured video
    // POSTCONDITIONS (1 returns):
    // 1.) error: a string that gives information as to why their video URL is problematic, if there is any problems.
    // if this string returns undefined, it means no errors were detected
    const validateVideoDescription = (description, featuredVideo) => {
        // if the description exists, it is necessary that a featured video must also exist
        if (description && !featuredVideo) {
            return "Featured YouTube Video URL is required to fill out this field.";
        }

        // check that the description is within the character limit of 200 characters
        if (description.length > 200) {
            return "Video Description must be 200 characters or less.";
        }

        return undefined;
    };

    // FUNCTION 10: getFileInfo - determine the file information from an image form ref
    // PRECONDITIONS (1 parameter):
    // 1.) avatarRef: a ref to the image input for avatar form
    // POSTCONDITIONS (2 returns):
    // 1.) file: the file object associated with the ref hook
    // 2.) fileExt: the extension of the file
    const getFileInfo = avatarRef => {
        const file = avatarRef.current.files[0];
        return { file: file, fileExt: file.name.split(".").pop() };
    };

    // FUNCTION 11: validateAvatar - determine if user has uploaded a valid avatar
    // PRECONDITIONS (2 parameters):
    // 1.) avatarRef: a ref to the image input for avatar form
    // 2.) profile: a profile object that is either defined or undefined. if undefined, this indicates that the user has not yet
    // created their profile
    // POSTCONDTIONS (1 parameter):
    // 1.) error: error: a string that gives information as to why their image is problematic, if there is any problems.
    // if this string returns undefined, it means no errors were detected
    const validateAvatar = (avatarRef, profile) => {
        // first, check if the user has created a profile. if they have not, return an error message
        if (!profile) {
            return "Please edit your profile information before choosing an avatar.";
        }

        // next, check if the user actually chose a file. cannot upload a non-existant image as an avatar
        if (!avatarRef.current.files || avatarRef.current.files.length === 0) {
            return "You must select an image to upload.";
        }

        // get information about the file from the avatar ref hook
        const { file, fileExt } = getFileInfo(avatarRef);

        // next, we need to check the file extension
        const validExtensions = ["png", "jpg", "jpeg"];
        if (!validExtensions.includes(fileExt)) {
            return "Invalid file type.";
        }

        // finally, we need to check the file size. if the file exceeds 5mb, return an error
        if (file.size > 5000000) {
            return "File size too big.";
        }

        return undefined;
    };

    // FUNCTION 12: convertToPNG - async function that takes a file object, and converts it to a PNG, if necessary
    // PRECONDITIONS (1 parameter):
    // 1.) file: a File object of one of the three types: PNG, JPG, or JPEG
    // POSTCONDITIONS (3 possible outcomes):
    // if the file is already a png, the file will simply be returned
    // if the file is a jpg or jpeg, and the conversion is successful, an new File object is returned, storing the image converted to
    // a png
    // if the file is a jpg or jpeg, and the conversion is a failure, the promise resolves to an error, which is handled by the caller function
    const convertToPNG = async (file) => {
        if (file.type === "image/jpeg" || file.type === "image/jpg") {
            return new Promise((resolve, reject) => {
                // create our image file
                const img = new Image();

                // code that is executed once the image file is fully loaded
                img.onload = function() {
                    // create canvas
                    const canvas = document.createElement("canvas");
                    const ctx = canvas.getContext('2d');

                    // set canvas size
                    canvas.width = img.width;
                    canvas.height = img.height;
                    ctx.drawImage(img, 0, 0);

                    // perform conversion
                    canvas.toBlob(function(blob) {
                        const convertedFile = new File([blob], file.name, {
                            type: "image/png",
                            lastModified: file.lastModified,
                          });
                          resolve(convertedFile);
                    }, "image/png");
                };

                // code that is executed if the file conversion fails
                img.onerror = function(error) {
                    reject(error);
                };

                // set the src property to the file converted to an object URL
                img.src = URL.createObjectURL(file);
            });
        };

        // otherwise, simply return the file
        return file;
    };

    return { 
        generateFormVals, 
        validateUsername, 
        validateBio, 
        validateYoutubeHandle,
        validateTwitchUsername,
        validateTwitterHandle,
        validateDiscord, 
        validateFeaturedVideo, 
        validateVideoDescription,
        getFileInfo, 
        validateAvatar,
        convertToPNG
    };
};

/* ===== EXPORTS ===== */
export default ProfileUtils;