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
    const { dateB2F, recordB2F } = FrontendHelper();

    // FUNCTION 1: submission2Form ("submission to form")
    // PRECONDITIONS (5 parameters):
    // 1.) submission: a submission object, or undefined
    // 2.) type: a string, either "score" or "time"
    // 3.) level: a level object containing information about the level
    // 4.) category: a string representing a valid category
    // 5.) profile: a profile object, containing at least the id, username, and country fields
    // POSTCONDITIONS (2 possible outcomes, 1 return):
    // if submission is defined, we use the information from this object to define the return object
    // if not, we set many of the form values to their default values
    // the object returned is compatible with the submission form
    const submission2Form = (submission, type, level, category, profile) => {
        // if a submission exists, we can use the data to form our formData object
        if (submission) {
            return {
                id: submission.id,
                record: recordB2F(submission.record, type, level.timer_type),
                score: submission.score,
                monkey_id: submission.monkey.id,
                platform_id: submission.platform.id,
                region_id: submission.region.id,
                live: submission.live,
                proof: submission.proof,
                comment: submission.comment ? submission.comment : "",
                profile_id: profile.id,
                game_id: game.abb,
                level_id: level.name,
                category: category,
                submitted_at: dateB2F(submission.submitted_at),
                tas: submission.tas,
                approved: submission.approve ? true : false
            };

        // if not, we can fill the object with default data values
        } else {
            return {
                record: "",
                hour: "",
                minute: "",
                second: "",
                centisecond: "",
                score: type === "score",
                monkey_id: game.monkey[0].id,
                platform_id: game.platform[0].id,
                region_id: game.region[0].id,
                live: true,
                proof: "",
                comment: "",
                profile: profile,
                game_id: game.abb,
                level_id: level.name,
                category: category,
                submitted_at: dateB2F(),
                tas: false
            };
        }
    };

    return {
        submission2Form
    };
};

/* ===== EXPORTS ===== */
export default LevelboardUtils;