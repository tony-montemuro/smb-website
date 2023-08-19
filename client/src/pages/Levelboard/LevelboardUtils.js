/* ===== IMPORTS ===== */
import { GameContext } from "../../utils/Contexts";
import { useContext } from "react";
import FrontendHelper from "../../helper/FrontendHelper";

const LevelboardUtils = () => {
    /* ===== CONTEXTS ===== */

    // game state from game context
    const { game } = useContext(GameContext);

    /* ===== FUNCTIONS ===== */

    // helper functions
    const { capitalize, dateB2F, recordB2F } = FrontendHelper();

    // FUNCTION 1: submission2Form ("submission to form")
    // PRECONDITIONS (5 parameters):
    // 1.) submission: a submission object, or undefined
    // 2.) type: a string, either "score" or "time"
    // 3.) levelName: a valid name of a level
    // 4.) category: a string representing a valid category
    // 5.) profile: a profile integer that belongs to some profile, or is null
    // POSTCONDITIONS (2 possible outcomes, 1 return):
    // if submission is defined, we use the information from this object to define the return object
    // if not, we set many of the form values to their default values
    // the object returned is compatible with the submission form
    const submission2Form = (submission, type, levelName, category, profileId) => {
        // if a submission exists, we can use the data to form our formData object
        if (submission) {
            const details = submission.details;
            return {
                record: recordB2F(details.record, type, submission.level.timer_type),
                score: submission.score,
                monkey_id: details.monkey.id,
                region_id: details.region.id,
                live: details.live,
                proof: details.proof,
                comment: details.comment ? details.comment : "",
                profile_id: parseInt(profileId),
                game_id: game.abb,
                level_id: levelName,
                category: category,
                submitted_at: dateB2F(details.submitted_at),
                message: ""
            };

        // if not, we can fill the object with default data values
        } else {
            return {
                record: "",
                score: type === "score" ? true : false,
                monkey_id: game.monkey[0].id,
                region_id: game.region[0].id,
                live: true,
                proof: "",
                comment: "",
                profile_id: profileId,
                game_id: game.abb,
                level_id: levelName,
                category: category,
                submitted_at: dateB2F(),
                message: ""
            };
        }
    };

    // FUNCTION 2: validateRecord - given a record field and type, validate the record
    // PRECONDITIONS (2 parameters):
    // 1.) recordField: a string value representing the record of the submission
    // 2.) type: a string value, either "score" or "time"
    // POSTCONDITIONS (1 return, 2 possible outcomes):
    // if the record is determined to be invalid, return a string that contains the error message
    // if the record is determined to be valid, return undefined
    const validateRecord = (recordField, type) => {
        // first, validate that record field is non-null
        if (!recordField) {
            return `${ capitalize(type) } is required.`;
        }

        // next, we need to perform two conversions, since it is no guaranteed that 'recordField' is of type
        // float or string
        const record = parseFloat(recordField);
        const recordStr = String(recordField);

        // let's check for invalid characters; specifically, the 'e' character
        if (recordStr.includes("e")) {
            return "Invalid character detected in submission. Please ensure submission has no letters.";
        }

        // validate that record is positive
        if (record <= 0) {
            return `${ capitalize(type) } must be a positive value.`;
        }

        // validate that record is not too large. this is somewhat arbitrary, but will leave it at this value for now*
        if (record > 2147483647) {
            return `${ capitalize(type) } is invalid.`;
        }

        // make sure scores are integers
        if (type === "score") {
            if (!Number.isInteger(record)) {
                return "Score must be an integer value.";
            }
        }

        // make sure time has two decimal places
        if (type === "time") {
            let decimalCount = 0;
            if (recordStr.includes('.')) {
                decimalCount = recordStr.split('.')[1].length;
            }
            if (decimalCount !== 2) {
                return "Please ensure your submission has two decimal places.";
            }
        }

        // if we made it this far, the record is valid! return undefined, since there is no error
        return undefined;
    };

    return {
        submission2Form, 
        validateRecord
    };
};

/* ===== EXPORTS ===== */
export default LevelboardUtils;