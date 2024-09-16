/* ===== IMPORTS ===== */
import { useState } from "react";
import AscendingHelper from "../../../helper/AscendingHelper";
import LevelHelper from "../../../helper/LevelHelper";

const LevelInput = (level) => {
    /* ===== STATES ===== */
    const [localState, setLocalState] = useState(level);

    /* ===== FUNCTIONS ===== */

    // helper functions
    const { getAscendingValue } = AscendingHelper();
    const { levelF2B } = LevelHelper();

    // FUNCTION 1: updateLocalState - code that executes when the user makes a change to the level input
    // PRECONDITIONS (1 parameter):
    // 1.) e: the event object that is generated by the change event in the form
    // POSTCONDITIONS (1 possible outcome):
    // the `localState` object is updated
    const updateLocalState = e => {
        let { id, value, checked } = e.target;
        const idVals = id.split("-");
        let field = idVals.at(-1);
        const ascending = localState.ascending;

        // special case: if we are dealing with an ascending field, let's determine singular value
        if (field.startsWith("ascending")) {
            let fieldVals = field.split(".");
            field = fieldVals[0];
            value = getAscendingValue(fieldVals[1], checked, ascending);
        }

        // add any "side effects" caused by certain inputs on certain fields
        const update = { [field]: value };
        switch (field) {
            case "chart_type":
                if (value === "score") {
                    update.time = 0;
                    update.timer_type = "";
                }

                if (["score", "time"].includes(value)) {
                    if (ascending === "both") {
                        update.ascending = value;
                    } else if (value !== ascending) {
                        update.ascending = null;
                    }
                }
                break;

            case "ascending":
                if (["both", "time"].includes(value)) {
                    update.time = 0;
                }
                break;

            case "name":
                update.name = levelF2B(value);
                break;

            case "time":
                break;
                
            default: break;
        };
        
        setLocalState({ ...localState, ...update });
    };

    return { localState, setLocalState, updateLocalState };
};

/* ===== EXPORTS ===== */
export default LevelInput;