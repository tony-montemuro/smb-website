/* ===== IMPORTS ===== */
import { MessageContext } from "../../../utils/Contexts";
import { useContext, useState } from "react";
import Download from "../../../database/storage/Download.js";

const Sections = (imageReducer) => {
    /* ===== CONTEXTS ===== */

    // add message function from message context
    const { addMessage } = useContext(MessageContext);

    /* ===== STATES ===== */
    const [images, setImages] = useState(undefined);

    /* ===== FUNCTIONS ===== */

    // database functions
    const { retrieveGameImage } = Download();

    // FUNCTION 1: renderBoolean - simple function that transforms boolean to string, so that it can be rendered to user
    // PRECONDITIONS (1 parameter):
    // 1.) bool: a boolean value
    // POSTCONDITIONS (2 possible outcomes):
    // if bool is true, return "Yes"
    // if bool is false, return "No"
    const renderBoolean = bool => {
        return bool ? "Yes" : "No";
    };

    // FUNCTION 2: fetchAssets - code that loads all the assets the user has uploaded
    // PRECONDITIONS (1 condition):
    // this code should execute on `GameAssets` component mount
    // POSTCONDITIONS (2 possible outcomes):
    // if the assets are all successfully grabbed from the backend, update the `assets` state, which will render each asset
    // otherwise, render an error message to the user
    const fetchAssets = async assets => {
        try {
            const abb = assets?.BOX_ART?.split(".")[0];

            let boxArt = null;
            if (abb) {
                boxArt = await retrieveGameImage(abb, imageReducer);
            }
            setImages({ ...images, boxArt });

        } catch (error) {
            addMessage("There was a problem retreiving the assets uploaded for this game. If reloading the page does not work, the system may be experiencing an outage.", "error", 15000);
        }
    };

    return { images, renderBoolean, fetchAssets };
};

/* ===== EXPORTS ===== */
export default Sections;