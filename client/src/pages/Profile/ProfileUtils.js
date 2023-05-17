// additional profile utility functions
const ProfileUtils = () => {
    /* ===== FUNCTIONS ===== */

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
                youtube_url: userInfo.youtube_url ? userInfo.youtube_url : "",
                twitch_url: userInfo.twitch_url ? userInfo.twitch_url : "",
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
                youtube_url: "",
                twitch_url: "",
                discord: "",
                featured_video: "",
                video_description: ""
            };
        }
    };

    // FUNCTION 2: validateUsername - determine if user has entered a valid username
    // PRECONDITIONS (3 parameters):
    // 1.) username: a string that the user has made for their username
    // 2.) id: a string that corresponds to the current user's id
    // 3.) profiles: an array of profile objects
    // POSTCONDITIONS (1 returns):
    // 1.) error: a string that gives information as to why their username is problematic, if there is any problems.
    // if this string returns undefined, it means no errors were detected
    const validateUsername = (username, id, profiles) => {
        // regex used to validate username
        const regex = new RegExp('^[A-Za-z0-9_]*$');

        // first, check that the username exists
        if (!username) {
            return "Error: Username is required to create a profile!";
        }
        
        // now, check that the length of the username is valid
        if (username.length < 4 || username.length > 25) {
            return "Error: Username must be between 4 and 25 characters long.";
        }

        // now, ensure the username is well-formatted (alphanumeric and underscores)
        if (!regex.test(username)) {
            return "Error: Username must consist only of letters, numbers, and/or underscores.";
        }

        // now, ensure that the username is unique among all usernames
        if (profiles.some(row => row.username === username && row.id !== id)) {
            return "Error: This username is already taken. Please try another username.";
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
            return "Error: About Me section must be 200 characters or less.";
        }

        return undefined;
    };

    // FUNCTION 4: validateDiscord - determine if user has entered a valid discord username
    // PRECONDITINOS (1 parameter):
    // 1.) discord: a string that the user has entered for their discord username
    // POSTCONDITIONS (1 returns):
    // 1.) error: a string that gives information as to why their discord username is problematic, if there is any problems.
    // if this string returns undefined, it means no errors were detected
    const validateDiscord = discord => {
        // regex used to validate the discord username
        const regex = new RegExp('^.{2,32}#\\d{4}$');

        // now, ensure the string conforms to the formatted expressed in the regex expression
        if (discord && !regex.test(discord)) {
            return "Error: Discord username is not properly formatted.";
        }

        return undefined;
    };

    // FUNCTION 5: validateFeaturedVideo - determine if the featured video has a valid format
    // PRECONDITIONS (1 parameter):
    // 1.) featuredVideo: a string that the user has entered for their featured video
    // POSTCONDITIONS (1 returns):
    // 1.) error: a string that gives information as to why their video URL is problematic, if there is any problems.
    // if this string returns undefined, it means no errors were detected
    const validateFeaturedVideo = featuredVideo => {
        // regex used to validate the featured video
        const regex = new RegExp('(?:https?://)?(?:www\\.)?youtu(?:\\.be/|be\\.com/\\S*(?:watch|embed)(?:(?:(?=/[-a-zA-Z0-9_]{11,}(?!\\S))/)|(?:\\S*v=|v/)))([-a-zA-Z0-9_]{11,})');
    
        // now, ensure the string conforms to the formatted expressed in the regex expression
        if (featuredVideo && !regex.test(featuredVideo)) {
            return "Error: Video URL is not properly formatted. Please make sure it is a YouTube video.";
        }

        return undefined;
    };

    // FUNCTION 6: validateVideoDescription - determine if the video description has a valid format
    // PRECONDITIONS (2 parameters):
    // 1.) description: a string that the user has entered for their video description
    // 2.) featuredVideo: a string that the user has entered for their featured video
    // POSTCONDITIONS (1 returns):
    // 1.) error: a string that gives information as to why their video URL is problematic, if there is any problems.
    // if this string returns undefined, it means no errors were detected
    const validateVideoDescription = (description, featuredVideo) => {
        // if the description exists, it is necessary that a featured video must also exist
        if (description && !featuredVideo) {
            return "Error: Featured YouTube Video URL is required to fill out this field.";
        }

        // check that the description is within the character limit of 200 characters
        if (description.length > 200) {
            return "Error: Video Description must be 200 characters or less.";
        }

        return undefined;
    };

    // FUNCTION 7: getFileInfo - determine the file information from an image form ref
    // PRECONDITIONS (1 parameter):
    // 1.) avatarRef: a ref to the image input for avatar form
    // POSTCONDITIONS (2 returns):
    // 1.) file: the file object associated with the ref hook
    // 2.) fileExt: the extension of the file
    const getFileInfo = avatarRef => {
        const file = avatarRef.current.files[0];
        return { file: file, fileExt: file.name.split(".").pop() };
    };

    // FUNCTION 8: validateAvatar - determine if user has uploaded a valid avatar
    // PRECONDITIONS (2 parameters):
    // 1.) avatarRef: a ref to the image input for avatar form
    // 2.) firstTimeUser: a boolean flag, whether or not the current user has profile created or not
    // POSTCONDTIONS (1 parameter):
    // 1.) error: error: a string that gives information as to why their image is problematic, if there is any problems.
    // if this string returns undefined, it means no errors were detected
    const validateAvatar = (avatarRef, firstTimeUser) => {
        // first, check if the user has created a profile. if they have not, return an error message
        if (firstTimeUser) {
            return "Error: Please edit your profile information before choosing an avatar.";
        }

        // next, check if the user actually chose a file. cannot upload a non-existant image as an avatar
        if (!avatarRef.current.files || avatarRef.current.files.length === 0) {
            return "Error: You must select an image to upload.";
        }

        // get information about the file from the avatar ref hook
        const { file, fileExt } = getFileInfo(avatarRef);

        // next, we need to check the file extension
        const validExtensions = ["png", "jpg", "jpeg"];
        if (!validExtensions.includes(fileExt)) {
            return "Error: Invalid file type.";
        }

        // finally, we need to check the file size. if the file exceeds 5mb, return an error
        if (file.size > 5000000) {
            return "Error: File size too big.";
        }

        return undefined;
    };

    // FUNCTION 9: convertToPNG - async function that takes a file object, and converts it to a PNG, if necessary
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