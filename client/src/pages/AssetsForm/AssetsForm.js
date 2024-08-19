/* ===== IMPORTS ===== */
import { GameAddContext, MessageContext } from "../../utils/Contexts";
import { useContext, useState } from "react";
import Download from "../../database/storage/Download.js";
import FileHelper from "../../helper/FileHelper.js";
import Upload from "../../database/storage/Upload.js";

const AssetsForm = (imageReducer, assets) => {
    /* ===== CONTEXTS ===== */

    // keys object from game add context
    const { keys } = useContext(GameAddContext);

    // add message function from message context
    const { addMessage } = useContext(MessageContext);

    /* ===== VARIABLES ===== */
    const metadataKey = keys.metadata;
    const assetsKey = keys.assets;

    /* ===== STATES ===== */
    const [error, setError] = useState(undefined);
    const [uploading, setUploading] = useState(false);

    /* ===== FUNCTIONS ===== */
    
    // database functions
    const { updateImageByAbb } = Download();
    const { uploadBoxArt } = Upload();

    // helper functions
    const { getFileInfo, checkImageDimension } = FileHelper();

    // FUNCTION 1: validateBoxArt - code that validates whether or not a box art is valid
    // PRECONDITIONS (1 parameter):
    // 1.) boxArtRef: a ref hook that is assigned to the box art input
    // POSTCONDITIONS (2 possible outcomes):
    // if the image is validated, this function returns nothing
    // otherwise, this function will return the error message describing the problem
    const validateBoxArt = async (boxArtRef) => {
        // get information about the file
        const { file, fileExt } = getFileInfo(boxArtRef);

        // next, we need to check the file extension
        if (!assets.boxArt.fileTypes.includes(fileExt)) {
            return "Invalid file type.";
        }

        // finally, we need to check the file size. if the file exceeds the maximum dimensions, return an error
        try {
            const { MAX_WIDTH, MAX_HEIGHT } = assets.boxArt.dimensions;
            await checkImageDimension(file, MAX_WIDTH, MAX_HEIGHT);
            return undefined;
        } catch (error) {
            return error;
        };
    };

    // FUNCTION 2: updateAssets - code that updates the list of assets we have uploaded
    // PRECONDITIONS (2 parameters):
    // 1.) key: a string, which tells the function which asset needs to be updated
    // 2.) assetName: a string, which stores the name of the asset we are saving
    // POSTCONDITIONS (1 parameter):
    // we update local storage to keep track of the asset
    const updateAssets = (key, assetName) => {
        const currentAssets = JSON.parse(localStorage.getItem(assetsKey));
        const newAssets = { ...currentAssets, [key]: assetName };
        localStorage.setItem(assetsKey, JSON.stringify(newAssets));
    };

    // FUNCTION 3: handleSubmit - code that is executed when the user submits the form
    // PRECONDITIONS (2 parameters):
    // 1.) e: event object generated when the user submits the form
    // 2.) boxArtRef: a ref hook that is assigned to the box art input
    // POSTCONDITIONS (3 possible outcomes):
    // if the image is not valid, render an error message to the user, and return early
    // if the image is valid, but fails to upload, render an error message to the user
    // if the image is valid, and successfully uploads, render a success message to the user
    const handleBoxArtSubmit = async (e, boxArtRef) => {
        e.preventDefault();
        
        setUploading(true);
        try {
            // validate box art image
            const error = await validateBoxArt(boxArtRef);
            setError(error);

            // if not valid, return early
            if (error) {
                return;
            }
            
            // finally, if we made it this far, attempt to upload the image
            const { file } = getFileInfo(boxArtRef);
            let metadata = localStorage.getItem(metadataKey);
            metadata = JSON.parse(metadata);
            const abb = metadata.abb;
            const fileName = `${ abb }.png`;
            await uploadBoxArt(file, fileName);
            updateAssets(assets.boxArt.key, fileName);

            // re-download the new image & update the global image state, and render a success message
            await updateImageByAbb(abb, imageReducer, true);
            addMessage("Box art successfully uploaded!", "success", 5000);

        } catch (error) {
            addMessage(error.message, "error", 5000);
        } finally {
            boxArtRef.current.value = "";
            setUploading(false);
        }
    };

    return { error, uploading, handleBoxArtSubmit };
};

/* ===== EXPORTS ===== */
export default AssetsForm;