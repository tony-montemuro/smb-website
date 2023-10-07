const ProfileUtils = () => {
    /* ===== FUNCTIONS ===== */

    // FUNCTION 1: getFileInfo - determine the file information from an image form ref
    // PRECONDITIONS (1 parameter):
    // 1.) avatarRef: a ref to the image input for avatar form
    // POSTCONDITIONS (2 returns):
    // 1.) file: the file object associated with the ref hook
    // 2.) fileExt: the extension of the file
    const getFileInfo = avatarRef => {
        const file = avatarRef.current.files[0];
        return { file: file, fileExt: file.name.split(".").pop() };
    };

    // FUNCTION 2: validateAvatar - determine if user has uploaded a valid avatar
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

    // FUNCTION 3: convertToPNG - async function that takes a file object, and converts it to a PNG, if necessary
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
        getFileInfo, 
        validateAvatar,
        convertToPNG
    };
};

/* ===== EXPORTS ===== */
export default ProfileUtils;