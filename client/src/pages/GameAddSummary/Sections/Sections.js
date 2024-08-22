/* ===== IMPORTS ===== */
import { GameAddContext, MessageContext } from "../../../utils/Contexts";
import { useContext, useState } from "react";
import Download from "../../../database/storage/Download.js";

const Sections = (imageReducer) => {
    /* ===== CONTEXTS ===== */

    // keys object from game add context
    const { keys } = useContext(GameAddContext);

    // add message function from message context
    const { addMessage } = useContext(MessageContext);

    /* ===== VARIABLES ===== */
    const assetsKey = keys.assets;
    const assetsObj = JSON.parse(localStorage.getItem(assetsKey));

    /* ===== STATES ===== */
    const [assets, setAssets] = useState(undefined);

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
    const fetchAssets = async () => {
        try {
            const abb = assetsObj.BOX_ART?.split(".")[0];

            if (abb) {
                const boxArt = await downloadBoxArt(abb);
                setAssets({ ...assets, boxArt: boxArt });
            }
        } catch (error) {
            addMessage("There was a problem retreiving the assets uploaded for this game. If reloading the page does not work, the system may be experiencing an outage.", "error", 15000);
        }
    };

    return { assets, renderBoolean, fetchAssets };
};

/* ===== EXPORTS ===== */
export default Sections;