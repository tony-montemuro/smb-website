/* ===== IMPORTS ===== */
import { MessageContext } from "../../utils/Contexts";
import { useContext, useState } from "react";
import { versionPattern } from "../../utils/RegexPatterns";
import GameRead from "../../database/read/GameRead";
import ScrollHelper from "../../helper/ScrollHelper.js";
import StylesHelper from "../../helper/StylesHelper.js";

const Versions = () => {
    /* ===== VARIABLES ===== */
    const versionInit = {
        value: "",
        error: undefined
    };
    const firstVersion = {
        sequence: 1,
        version: "1.0"
    };

    /* ===== CONTEXTS ===== */

    // add message function from message context
    const { addMessage } = useContext(MessageContext);

    /* ===== STATES ===== */
    const [game, setGame] = useState(undefined);
    const [games, setGames] = useState(undefined);
    const [version, setVersion] = useState(versionInit);
    const [versions, setVersions] = useState([firstVersion]);

    /* ===== FUNCTIONS ===== */
    
    // database functions
    const { queryGamesForModerators } = GameRead();

    // helper functions
    const { scrollToId } = ScrollHelper();
    const { getNavbarHeight } = StylesHelper();

    // FUNCTION 1: queryGames - code that is executed when the `Versions` component mounts
    // PRECONDITIONS: NONE
    // POSTCONDITIONS (2 possible outcomes):
    // if the games are successfully queried, simply update the `game` & `games` state by calling the `setGame` & `setGames` setter functions
    // if the games are unsuccessfully queried, render an error message, which should keep the component loading
    const queryGames = async () => {
        try {
            const games = await queryGamesForModerators();
            const game = games[0];
            setGame(game);
            setGames(games);
            if (game.version.length > 0) {
                setVersions(game.version);
            }
        } catch (error) {
            addMessage("There was an error fetching the moderator data. If refreshing the page does not work, the system may be experiencing an outage.", "error", 10000);
        };
    };

    // FUNCTION 2: switchGame - code that is executed when the administrator selects a game
    // PRECONDITIONS (1 parameter):
    // 1.) game: a game object, which belongs to the game the user selected
    // POSTCONDITIONS (1 possible outcome):
    // the game state is updated, and the user is scrolled to the moderation editor
    const switchGame = game => {
        setGame(game);
        setVersions(game.version.length > 0 ? game.version : [firstVersion]);
        let tabsHeight = getNavbarHeight()/2;
        if (window.innerWidth <= 800) {
            tabsHeight *= 3;
        }
        scrollToId("content", tabsHeight);
    };

    // FUNCTION 3: handleVersionChange - code that is executed when the user makes changes to the version field
    // PRECONDITIONS (1 parameter):
    // 1.) e: the event object that is generated when the user makes a change to the version input
    // POSTCONDITIONS (1 possible outcome):
    // the version state is updated with the user's changes
    const handleVersionChange = e => setVersion({ 
        ...version, 
        value: e.target.value, 
        error: undefined 
    });
    
    // FUNCTION 4: validateVersion - code that validates a version is correctly formatted
    // PRECONDITIONS (1 parameter):
    // 1.) version: a version string, entered by a user
    // POSTCONDITIONS (2 possible outcomes):
    // the function returns a string containing an error message if validation fails
    // otherwise, this function returns undefined, meaning no issues
    const validateVersion = version => {
        if (!versionPattern.test(version)) {
            return "Version must consist of letters, numbers, and periods (.), and cannot start with a period (.).";
        }

        return undefined;
    };

    // FUNCTION 5: handleSubmit - code that is executed when the version form is submitted
    // PRECONDITIONS (1 parameter):
    // 1.) e: the event object that is generated when the user submits the form
    // POSTCONDITIONS (2 possible outcome):
    // if the version is not validated, we updated the error field in the `version` state, and return early
    // the new version is added to the `versions` state
    const handleSubmit = e => {
        e.preventDefault();

        // attempt to validate version
        const error = validateVersion(version.value);
        if (error) {
            addMessage("There was a problem adding this version.", "error", 6000);
            setVersion({ ...version, error });
            return;
        }
        
        // now, we will update the versions state, as well as clearing the version state
        setVersions([...versions, { 
            version: version.value, sequence: versions.at(-1).sequence + 1 
        }]);
        setVersion(versionInit);
    };

    return { 
        game,
        games,
        version,
        versions,
        queryGames,
        switchGame,
        handleVersionChange,
        handleSubmit
    };
};

/* ===== EXPORTS ===== */
export default Versions;