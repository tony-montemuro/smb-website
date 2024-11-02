/* ===== IMPORTS ===== */
import { MessageContext } from "../../utils/Contexts";
import { useCallback, useContext, useState } from "react";
import { versionPattern } from "../../utils/RegexPatterns";
import CategoryRead from "../../database/read/CategoryRead.js";
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
    const versionsInit = {
        values: [firstVersion],
        errors: {}
    };

    /* ===== CONTEXTS ===== */

    // add message function from message context
    const { addMessage } = useContext(MessageContext);

    /* ===== STATES ===== */
    const [game, setGame] = useState(undefined);
    const [games, setGames] = useState(undefined);
    const [version, setVersion] = useState(versionInit);
    const [versions, setVersions] = useState(versionsInit);

    /* ===== FUNCTIONS ===== */
    
    // database functions
    const { queryGamesForModerators } = GameRead();
    const { queryStructureByGame } = CategoryRead();

    // helper functions
    const { scrollToId } = ScrollHelper();
    const { getNavbarHeight } = StylesHelper();

    // FUNCTION 1: getStructure - code that is excuted after a change to the game state
    // PRECONDITIONS (1 parameter):
    // 1.) game: a game object, which we want to grab the structure for
    // POSTCONDITIONS (2 possible outcomes):
    // if the query is successful, we update the game state to include this information
    // if the query is unsuccessful, we render an error message to the user
    const getStructure = async game => {
        try {
            const structure = await queryStructureByGame(game.abb);
            
            // now, let's add a "version" property to each level
            structure.forEach(category => {
                category.mode.forEach(mode => {
                    mode.level.forEach(level => level.version = undefined);
                });
            });

            setGame({ ...game, structure });
        } catch (error) {
            addMessage("There was a problem loading the levels for this game. If this error persists, the system may be experiencing an outage.", "error", 15000);
        }
    };

    // FUNCTION 2: switchGame - code that is executed when the administrator selects a game
    // PRECONDITIONS (1 parameter):
    // 1.) game: a game object, which belongs to the game the user selected
    // POSTCONDITIONS (1 possible outcome):
    // the game state is updated, and the user is scrolled to the moderation editor
    const switchGame = async game => {
        const unsaved = 
            (game.version.length === 0 && versions.values.length > 1) || // case 1: game has no versions, and user has entered at least 1
            (game.version.length > 0 && game.version.length !== versions.length); // case 2: game has versions, and user has entered at least 1
        if (unsaved && !window.confirm("Are you sure you want to switch games? Your progress will be lost!")) {
            return;
        }

        // update game, version, & versions states
        setGame(game);
        setVersion(versionInit);
        const updatedVersions = { ...versions, values: game.version.length > 0 ? game.version : [firstVersion] }; 
        setVersions(updatedVersions);

        // scroll
        let tabsHeight = getNavbarHeight()/2;
        if (window.innerWidth <= 800) {
            tabsHeight *= 3;
        }
        scrollToId("content", tabsHeight);

        // finally, we need to grab the game structure from the backend
        await getStructure(game);
    };

    // FUNCTION 3: queryGames - code that is executed when the `Versions` component mounts
    // PRECONDITIONS: NONE
    // POSTCONDITIONS (2 possible outcomes):
    // if the games are successfully queried, simply update the `game` & `games` state by calling the `setGame` & `setGames` setter functions
    // if the games are unsuccessfully queried, render an error message, which should keep the component loading
    const queryGames = async () => {
        try {
            const games = await queryGamesForModerators();
            setGames(games);
            switchGame(games[0]);
        } catch (error) {
            addMessage("There was an error fetching the moderator data. If refreshing the page does not work, the system may be experiencing an outage.", "error", 10000);
        };
    };

    // FUNCTION 4: handleVersionChange - code that is executed when the user makes changes to the version field
    // PRECONDITIONS (1 parameter):
    // 1.) e: the event object that is generated when the user makes a change to the version input
    // POSTCONDITIONS (1 possible outcome):
    // the version state is updated with the user's changes
    const handleVersionChange = e => setVersion({ 
        ...version, 
        value: e.target.value, 
        error: undefined 
    });

    // FUNCTION 5: handleVersionsChange - code that is executed when the user makes changes to one of many fields
    // rendered by the `versions` state
    // PRECONDITIONS (1 parameter):
    // 1.) e: the event object that is generated when the user makes a change to the version input
    // POSTCCONDITIONS (1 possible outcome):
    // the correct element in the versions state is updated with the user's changes
    const handleVersionsChange = e => {
        const { id, value } = e.target;
        let sequence = parseInt(id.split("_").at(-1));
        const updatedVersions = versions.values.map(version => version.sequence === sequence ? 
            { ...version, version: value } : 
            version
        );

        // now, if there exists any errors on current input, let's remove them
        let errors = versions.errors;
        sequence = `${ sequence }`;
        if (sequence in versions.errors) {
            errors = Object.fromEntries(
                Object.entries(errors).filter(([key]) => key !== sequence)
            );
        }
        setVersions({ values: updatedVersions, errors });
    };
    
    // FUNCTION 6: validateVersion - code that validates a version is correctly formatted
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

    // FUNCTION 7: validateVersions - code that is executed each time the user finishes making changes to one of
    // the versions rendered by the `versions` state
    // PRECONDITIONS (1 parameter):
    // 1.) e: the event object generated by the "blur" event on a `versions` input
    // POSTCONDITIONS (2 possible outcomes):
    // if the particular version we are observing has an error, we update the `errors` field of the versions state
    // otherwise, this function does nothing
    const validateVersions = e => {
        const { id, value } = e.target;
        const sequence = id.split("_").at(-1);
        const error = validateVersion(value);

        if (error) {
            setVersions({ ...versions, errors: { [sequence]: error } });
        }
    };

    // FUNCTION 8: handleSubmit - code that is executed when the version form is submitted
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
        setVersions({ ...versions, values: [...versions.values, { 
            version: version.value, sequence: versions.values.at(-1).sequence + 1 
        }]});
        setVersion(versionInit);
    };

    // FUNCTION 9: onVersionCheck - code that is executed when the user selects a version checkbox
    // PRECONDITIONS (1 parameter):
    // 1.) e: the event object generated when the user checks a version checkbox
    // POSTCONDITIONS (2 possible outcome):
    // if the box is already checked, the version should be set to undefined
    // if the box is not already checked, the version should be set to the version specified by the name of the input
    const onVersionCheck = useCallback(e => {
        const { name, checked } = e.target;
        const nameParts = name.split(":");
        const version = nameParts[0];
        const categoryName = nameParts[1];
        const levelName = nameParts.slice(2).join(":");
        const gameCopy = { ...game };
        const category = gameCopy.structure.find(category => category.name === categoryName);

        category.mode.forEach(mode => {
            mode.level.forEach(level => {
                if (level.name === levelName) {
                    level.version = checked ? version : undefined;
                }
            });
        });
        
        setGame(gameCopy);
    }, [game, setGame]); // should only be redefined when game OR setGame is updated

    return { 
        game,
        games,
        version,
        versions,
        queryGames,
        switchGame,
        handleVersionChange,
        handleVersionsChange,
        validateVersions,
        handleSubmit,
        onVersionCheck
    };
};

/* ===== EXPORTS ===== */
export default Versions;