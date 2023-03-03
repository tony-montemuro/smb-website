const ProfileHelper = () => {
    // FUNCTION 1: generateFormVals - generate an object representing the form values
    // PRECONDITIONS (1 parameter):
    // 1.) userInfo - an profile object, which will be undefined if the user has not yet set up their profile
    // 2.) userId - a string representing the id of the current user
    // POSTCONDITINOS (1 parameter):
    // 1.) formObj - an object generated to take the data from userInfo and make it "form friendly"
    const generateFormVals = (userInfo, userId) => {
        if (userInfo) {
            return {
                id: userId,
                username: userInfo.username,
                bio: userInfo.bio ? userInfo.bio : "",
                country: userInfo.country ? userInfo.country.iso2 : "",
                youtube_url: userInfo.youtube_url ? userInfo.youtube_url : "",
                twitch_url: userInfo.twitch_url ? userInfo.twitch_url : "",
                discord: userInfo.discord ? userInfo.discord : ""
            };
        } else {
            return {
                id: userId,
                username: "",
                bio: "",
                country: "",
                youtube_url: "",
                twitch_url: "",
                discord: ""
            };
        }
    };

    // FUNCTION 2: validateUsername - determine if user has entered a valid username
    // PRECONDITINOS (3 parameters):
    // 1.) username: a string that the user has made for their username
    // 2.) id: a string that corresponds to the current user's id
    // 3.) profiles: an array of profile objects
    // POSTCONDITINOS (1 returns):
    // 1.) error: a string that gives information as to why their username is problematic, if there is any problems.
    // if this string returns undefined, it means no errors were detected
    const validateUsername = (username, id, profiles) => {
        console.log(username);
        // regex used to validate username
        const regex = new RegExp('^[A-Za-z0-9_]*$');

        // first, check that the username exists
        if (!username) {
            return "Error: Username is required to create a profile!";
        }
        
        // now, check that the length of the username is valid
        if (username.length < 5 || username.length > 25) {
            return "Error: Username must be between 5 and 25 characters long.";
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
    // PRECONDITINOS (1 parameter):
    // 1.) bio: a string that the user has made for their bio
    // POSTCONDITINOS (1 returns):
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
    // POSTCONDITINOS (1 returns):
    // 1.) error: a string that gives information as to why their discord username is problematic, if there is any problems.
    // if this string returns undefined, it means no errors were detected
    const validateDiscord = discord => {
        // regex used to validate the discord username
        const regex = new RegExp('^.{2,32}#\\d{4}$');

        // now, ensure the string conforms to the formatted expressed in the regex expression
        if (!regex.test(discord)) {
            return "Error: Discord username is not properly formatted.";
        }

        return undefined;
    };

    // FUNCTION 5: getFileInfo - determine the file information from an image form ref
    // PRECONDITIONS (1 parameter):
    // 1.) avatarRef: a ref to the image input for avatar form
    // POSTCONDITIONS (2 returns):
    // 1.) file: the file object associated with the ref hook
    // 2.) fileExt: the extension of the file
    const getFileInfo = (avatarRef) => {
        const file = avatarRef.current.files[0];
        return { file: file, fileExt: file.name.split(".").pop() };
    };

    // FUNCTION 6: validateAvatar - determine if user has uploaded a valid avatar
    // PRECONDITIONS (3 parameters):
    // 1.) avatarRef: a ref to the image input for avatar form
    // 2.) userId: a string representing the id of the current user
    // 3.) firstTimeUser: a boolean flag, whether or not the current user has profile created or not
    // POSTCONDTIONS (1 parameter):
    // 1.) error: error: a string that gives information as to why their image is problematic, if there is any problems.
    // if this string returns undefined, it means no errors were detected
    const validateAvatar = (avatarRef, userId, firstTimeUser) => {
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

    return { generateFormVals, validateUsername, validateBio, validateDiscord, getFileInfo, validateAvatar };
};

export default ProfileHelper;