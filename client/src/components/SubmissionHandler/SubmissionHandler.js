/* ===== IMPORTS ===== */
import { MessageContext, UserContext } from "../../utils/Contexts";
import { useContext, useState } from "react";
import RPCRead from "../../database/read/RPCRead";

const SubmissionHandler = (isUnapproved) => {
    /* ===== STATES ===== */
    const [submissions, setSubmissions] = useState(undefined);

    /* ===== CONTEXTS ===== */

    // add message function from message context
    const { addMessage } = useContext(MessageContext);

    // user state & update user function from user context
    const { user } = useContext(UserContext);

    /* ===== FUNCTIONS ===== */

    // database functions
    const { getUnapprovedByGame, getReportedByGame } = RPCRead();

    // FUNCTION 1: fetchSubmissions - code that is executed each time the game state / isUnapproved parameter is updated
    // PRECONDITIONS (1 parameter):
    // 1.) game: a game object which contains information about the game
    // POSTCONDITIONS (3 possible outcomes):
    // if the game has no unapproved / reported submissions, then simply update the submissions state to an empty array, and return early
    // if the query is successful, an array of submissions for that game is returned (either unapproved or reported)
    // otherwise, an error is returned, and we render an error message to the user
    const fetchSubmissions = async game => {
        // special case: unapproved is true and the game has no unapproved submissions, or unapproved is false and the game has no
        // reported submissions. in this case, we can go ahead and just update the submissions state to an empty array, and return
        if ((isUnapproved && game.unapproved === 0) || (!isUnapproved && game.reported === 0)) {
            setSubmissions([]);
            return;
        }

        // general case: reset the submission state to undefined, and attempt to query the unapproved / reported submissions
        setSubmissions(undefined);
        try {
            const query = isUnapproved ? getUnapprovedByGame(game.abb) : getReportedByGame(game.abb);
            const submissions = await query;
            setSubmissions(submissions);
        } catch (error) {
            addMessage("Submission data failed to load.", "error");
        };
    };

    // FUNCTION 2: isClickable - a function that determines whether or not a submission can be clicked
    // PRECONDITIONS (1 parameter):
    // 1.) submission: a submission object
    // POSTCONDITIONS (2 possible outcomes):
    // in general, this function will return true
    // however, if the submission is NOT new, and the report that exists is either on a submission belonging to the current user,
    // or was created by the current user, we want to return false
    const isClickable = submission => {
        return !(!isUnapproved && (submission.profile_id === user.profile.id || submission.report.creator.id === user.profile.id));
    }

    return { 
        submissions,
        setSubmissions,
        fetchSubmissions,
        isClickable
    };
};

/* ===== EXPORTS ===== */
export default SubmissionHandler;