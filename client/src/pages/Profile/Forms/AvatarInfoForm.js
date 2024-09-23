/* ===== IMPORTS ===== */
import { MessageContext, UserContext } from "../../../utils/Contexts";
import { useContext, useReducer } from "react";
import Download from "../../../database/storage/Download";
import FileHelper from "../../../helper/FileHelper";
import Upload from "../../../database/storage/Upload";

const AvatarInfoForm = (MAX_IMG_LENGTH) => {
    /* ===== VARIABLES ===== */
    const initForm = { error: null, uploading: false };

    /* ===== CONTEXTS ===== */

    // add message function from message context
    const { addMessage } = useContext(MessageContext);

    // user state from user context
    const { user } = useContext(UserContext);

    /* ===== REDUCERS ===== */
    const [form, dispatchForm] = useReducer((state, action) => {
        return { ...state, [action.field]: action.value };
    }, initForm);

    /* ===== FUNCTIONS ===== */

    // database functions
    const { uploadAvatar } = Upload();
    const { updateImageByProfileId } = Download();
    
    // helper functions
    const { getFileInfo, checkImageDimension } = FileHelper();

    // FUNCTION 1: validateAvatar - determine if user has uploaded a valid avatar
    // PRECONDITIONS (1 parameter):
    // 1.) avatarRef: a ref to the image input for avatar form
    // POSTCONDTIONS (1 parameter):
    // 1.) error: error: a string that gives information as to why their image is problematic, if there is any problems.
    // if this string returns undefined, it means no errors were detected
    const validateAvatar = async avatarRef => {
        // first, check if the user actually chose a file. cannot upload a non-existant image as an avatar
        if (!avatarRef.current.files || avatarRef.current.files.length === 0) {
            return "You must select an avatar to upload.";
        }

        // get information about the file from the avatar ref hook
        const { file, fileExt } = getFileInfo(avatarRef);

        // next, we need to check the file extension
        const validExtensions = ["png", "jpg", "jpeg"];
        if (!validExtensions.includes(fileExt)) {
            return "Invalid file type.";
        }

        // finally, we need to check the file size. if the file exceeds the maximum dimensions, return an error
        try {
            await checkImageDimension(file, MAX_IMG_LENGTH, MAX_IMG_LENGTH);
            return undefined;
        } catch (error) {
            return error;
        };
    };

    // FUNCTION 2: convertToPNG - async function that takes a file object, and converts it to a PNG, if necessary
    // PRECONDITIONS (1 parameter):
    // 1.) file: a File object of one of the three types: PNG, JPG, or JPEG
    // POSTCONDITIONS (3 possible outcomes):
    // if the file is already a png, the file will simply be returned
    // if the file is a jpg or jpeg, and the conversion is successful, an new File object is returned, storing the image converted to
    // a png
    // if the file is a jpg or jpeg, and the conversion is a failure, the promise resolves to an error, which is handled by the caller function
    const convertToPNG = async file => {
        if (file.type === "image/jpeg" || file.type === "image/jpg") {
            return new Promise((resolve, reject) => {
                // create our image file
                const img = new Image();

                // code that is executed once the image file is fully loaded
                img.onload = () => {
                    // create canvas
                    const canvas = document.createElement("canvas");
                    const ctx = canvas.getContext("2d");

                    // set canvas size
                    canvas.width = img.width;
                    canvas.height = img.height;
                    ctx.drawImage(img, 0, 0);

                    // perform conversion
                    canvas.toBlob((blob) => {
                        const convertedFile = new File([blob], file.name, {
                            type: "image/png",
                            lastModified: file.lastModified,
                          }
                        );
                        resolve(convertedFile);
                    }, "image/png");
                };

                // code that is executed if the file conversion fails
                img.onerror = (error) => {
                    reject(error);
                };

                // set the src property to the file converted to an object URL
                img.src = URL.createObjectURL(file);
            });
        };

        // otherwise, simply return the file
        return file;
    };

    // FUNCTION 3: submitAvatar - function that validates, processes, & submits an avatar
    // PRECONDITIONS (2 parameters):
    // 1.) e: an event object that is generated when the user submits the form
    // 2.) avatarRef: a ref hook that is assigned to the avatar input
    // 3.) imageReducer: an object with two fields:
        // a.) reducer: the image reducer itself (state)
        // b.) dispatchSubmissions: the reducer function used to update the reducer
    // POSTCONDITIONS (2 possible outcomes): 
    // if the avatar form is validated, we upload the image and update the user's profile in the database, 
    // and reload the page.
    // if the form fails to validate, we update the error field of the avatar form with the validation error,
    // and return from the function early
    const submitAvatar = async (e, avatarRef, imageReducer) => {
        // initialize update
        e.preventDefault();

        try {
            // validate the user uploaded avatar
            const error = await validateAvatar(avatarRef);

            // if there is an error, return early
            dispatchForm({ field: "error", value: error });
            if (error) {
                addMessage("There was a problem uploading your avatar.", "error", 5000);
                return;
            }

            // convert file and upload
            const { file } = getFileInfo(avatarRef);
            const profileId = user.profile.id;
            dispatchForm({ field: "uploading", value: true });
            const convertedFile = await convertToPNG(file);
            await uploadAvatar(convertedFile, `${ profileId }.png`);

            // re-download the new image & update the global image state, and render a success message
            await updateImageByProfileId(profileId, imageReducer, true);
            addMessage("Avatar successfully uploaded. If it is not showing up, give it some time and reload the page.", "success", 9000);
            
        } catch (error) {
            addMessage("There was a problem uploading your avatar. Refresh the page and try again.", "error", 10000);
        } finally {
            avatarRef.current.value = "";
            dispatchForm({ field: "uploading", value: false });
        };
    };

    return { form, submitAvatar };
};

/* ===== EXPORTS ===== */
export default AvatarInfoForm;