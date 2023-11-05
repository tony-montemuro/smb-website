/* ===== IMPORTS ===== */
import { ToastContext, UserContext } from "../../utils/Contexts";
import { useContext, useState } from "react";
import RPCRead from "../../database/read/RPCRead";
import ScrollHelper from "../../helper/ScrollHelper";
import StylesHelper from "../../helper/StylesHelper";

const SubmissionHandler = (isUnapproved) => {
    /* ===== STATES ===== */
    const [submissions, setSubmissions] = useState(undefined);
    const [game, setGame] = useState(undefined);

    /* ===== CONTEXTS ===== */

    // add message function from toast context
    const { addToastMessage } = useContext(ToastContext);

    // user state & update user function from user context
    const { user } = useContext(UserContext);

    /* ===== FUNCTIONS ===== */

    // database functions
    const { getUnapprovedByGame, getReportedByGame } = RPCRead();

    // helper functions
    const { getNavbarHeight } = StylesHelper();
    const { scrollToId } = ScrollHelper();

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
            addToastMessage("Submission data failed to load. If reloading the page does not work, the system may be experiencing an outage.", "error", 10000);
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

    // FUNCTION 3: setGameAndScroll - code that is executed when the moderator selects a game
    // PRECONDITIONS (1 parameter):
    // 1.) game: a game object, which belongs to the game the user selected
    // POSTCONDITIONS (1 possible outcome):
    // the game state is updated, and the user is scrolled to the submission table
    const setGameAndScroll = game => {
        setGame(game);
        let tabsHeight = getNavbarHeight()/2;
        if (window.innerWidth <= 800) {
            tabsHeight *= 3;
        }
        scrollToId("content", tabsHeight);
    };

    return { 
        game,
        submissions,
        setGame,
        setSubmissions,
        fetchSubmissions,
        isClickable,
        setGameAndScroll
    };
};

/* ===== EXPORTS ===== */
export default SubmissionHandler;