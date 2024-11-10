/* ===== IMPORTS ===== */
import { MessageContext } from "../../utils/Contexts";
import { useCallback, useContext, useState } from "react";
import CategoryRead from "../../database/read/CategoryRead.js";
import GameRead from "../../database/read/GameRead";
import ScrollHelper from "../../helper/ScrollHelper.js";
import StylesHelper from "../../helper/StylesHelper.js";
import ValidationHelper from "../../helper/ValidationHelper.js";

const Versions = () => {
    /* ===== VARIABLES ===== */
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
    const [versions, setVersions] = useState([firstVersion]);

    /* ===== FUNCTIONS ===== */
    
    // database functions
    const { queryGamesForModerators } = GameRead();
    const { queryStructureByGame } = CategoryRead();

    // helper functions
    const { scrollToId } = ScrollHelper();
    const { getNavbarHeight } = StylesHelper();
    const { validateVersion } = ValidationHelper();

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
    // PRECONDITIONS: 1 parameter
    // 1.) newGame: a game object; the game we want to swap to
    // POSTCONDITIONS (1 possible outcome):
    // the game state is updated, and the user is scrolled to the moderation editor
    const switchGame = async newGame => {
        // if we are truly "switching games", let's prevent accidental swaps by giving the user a warning (if necessary)
        if (game) {
            const unsaved = 
                (game.version.length === 0 && versions.length > 1) || // case 1: game has no versions, and user has entered at least 1
                (game.version.length > 0 && game.version.length !== versions.length); // case 2: game has versions, and user has entered at least 1
            if (unsaved && !window.confirm("Are you sure you want to switch games? Your progress will be lost!")) {
                return;
            }
        }

        // update game, version, & versions states
        setGame(newGame);
        setVersions(newGame.version.length > 0 ? newGame.version : [firstVersion]);

        // scroll
        let tabsHeight = getNavbarHeight()/2;
        if (window.innerWidth <= 800) {
            tabsHeight *= 3;
        }
        scrollToId("content", tabsHeight);

        // finally, we need to grab the game structure from the backend
        await getStructure(newGame);
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

    // FUNCTION 4: handleVersionsChange - code that is executed when the user makes changes to one of many fields
    // rendered by the `versions` state
    // PRECONDITIONS (1 parameter):
    // 1.) e: the event object that is generated when the user makes a change to the version input
    // POSTCCONDITIONS (1 possible outcome):
    // the correct element in the versions state is updated with the user's changes
    const handleVersionsChange = e => {
        const { id, value } = e.target;
        let sequence = parseInt(id.split("_").at(-1));
        const oldVersion = versions.find(version => version.sequence === sequence).version;
        const updatedVersions = versions.map(version => version.sequence === sequence ? 
            { ...version, version: value } : 
            version
        );

        // cascade version update down to structure
        const gameCopy = { ...game };
        gameCopy.structure.forEach(category => {
            category.mode.forEach(mode => {
                for (let i = 0; i < mode.level.length; i++) {
                    const level = mode.level[i];
                    if (level.version === oldVersion) {
                        mode.level[i] = { ...level, version: value };
                    }
                }
            });
        });

        // update `versions` & `game` states
        setVersions(updatedVersions);
        setGame(gameCopy);
    };

    // FUNCTION 5: handleNewVersionSubmit - code that is executed when the new version form is submitted
    // PRECONDITIONS (1 parameter):
    // 1.) version: a string representing the version input that the user wants to add
    // POSTCONDITIONS (2 possible outcome):
    // if the version is not validated, we updated the error field in the `version` state, and return early with `error`
    // otherwise, the new version is added to the `versions` state
    const handleNewVersionSubmit = version => {
        // attempt to validate version
        const error = validateVersion(version, versions);
        if (error) {
            addMessage("There was a problem adding this version.", "error", 6000);
            return error;
        }
        
        // now, we will update the versions state
        setVersions([...versions, { 
            version: version, sequence: versions.at(-1).sequence + 1 
        }]);
    };

    // FUNCTION 6: onVersionCheck - code that is executed when the user selects a version checkbox
    // PRECONDITIONS (4 parameters):
    // 1.) checked: a boolean value that determines whether or not the user is turning the checkbox ON or OFF
    // 2.) version: a string representing the version of the box we are modifying
    // 3.) categoryName: a string representing the name of the category the box is within
    // 4.) levelName: a string representing the name of the level the box is associated with
    // POSTCONDITIONS (2 possible outcome):
    // if the box is already checked, the version should be set to undefined
    // if the box is not already checked, the version should be set to the version specified by the name of the input
    const onVersionCheck = useCallback((checked, version, categoryName, levelName) => {
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

    // FUNCTION 7: modeToggle - toggles all levels within a mode by version, either ON or OFF
    // PRECONDITIONS (3 parameters):
    // 1.) mode: a mode object, which contains the `level` key, an array of level objects
    // 2.) version: a string representing the version we are targetting
    // 3.) checked: a boolean, which determines whether or not we turn ON or OFF
    // POSTCONDITIONS (2 possible outcomes):
    // if checked is true, for each level, we set `version` to the `version` parameter
    // if checked is false, for each level, we unset `version`
    const modeToggle = (mode, version, checked) => {
        for (let i = 0; i < mode.level.length; i++) {
            const level = mode.level[i];
            mode.level[i] = { ...level, version: checked ? version : undefined };
        }
    }

    // FUNCTION 8: categoryToggle - toggles all levels within a category by version, either ON or OFF
    // PRECONDITIONS (3 parameters):
    // 1.) category: a category object, which contains the `mode` key, an array of mode objects
    // 2.) version: a string representing the version we are targetting
    // 3.) checked: a boolean, which determines whether or not we turn ON or OFF
    // POSTCONDITIONS (2 possible outcomes):
    // if checked is true, for each level, we set `version` to the `version` parameter
    // if checked is false, for each level, we unset `version`
    const categoryToggle = useCallback((category, version, checked) => {
        category.mode.forEach(mode => modeToggle(mode, version, checked));
    }, []);

    // FUNCTION 9: toggleAll - code that is executed when the user selects the "all" checkbox for a game
    // PRECONDITIONS (1 parameter):
    // 1.) e: the event object generated when the user clicks the checkbox
    // POSTCONDITIONS (2 possible outcomes):
    // if between 0 and (N-1) checkboxes are selected of `version`, we select all remaining boxes
    // if all checkboxes of selected `version` are on, we deselect all checkboxes
    const toggleAll = useCallback(e => {
        const { checked, name } = e.target;
        const version = name;
        const gameCopy = { ...game };
        gameCopy.structure = [...gameCopy.structure]; // this forces a re-render
        gameCopy.structure.forEach(category => categoryToggle(category, version, checked));
        setGame(gameCopy);
    }, [game, setGame, categoryToggle]);

    // FUNCTION 10: toggleAllPerCategory - code that is executed when the user selects a category checkbox
    // PRECONDITIONS (3 parameters):
    // 1.) checked: determines whether or not the user turned the checkbox on or off
    // 2.) version: the version we want to toggle on/off
    // 3.) category: an object; the set of checkboxes we want to toggle on/off should be within this category
    // POSTCONDITIONS (2 possible outcomes):
    // if between 0 and (N-1) checkboxes are selected of `version` within a category, we select all remaining boxes
    // if all checkboxes of selected `version` are on within a category, we deselect all checkboxes
    const toggleAllPerCategory = useCallback((checked, version, category) => {
        const gameCopy = { ...game };
        gameCopy.structure = [...gameCopy.structure]; // this forces a re-render of structure component
        categoryToggle(category, version, checked);
        setGame(gameCopy);
    }, [game, setGame, categoryToggle]); // should only be redefined when game OR setGame is updated

    // FUNCTION 11: toggleAllPerMode - function that toggles the checkboxes on all levels within a mode
    // PRECONDITIONS (3 parameters):
    // 1.) checked: determines whether or not the user turned the checkbox on or off
    // 2.) version: the version we want to toggle on/off
    // 3.) mode: an object; the set of checkboxes we want to toggle on/off should be within the mode
    // POSTCONDITIONS (2 possible outcomes):
    // if `isAllChecked` is true, we shut off all checkboxes on the level
    // if `isAllChecked` is true, we enable all remaining unchecked checkboxes in the set of levels (specifically, the
    // checkbox associated with the version specified by the user)
    const toggleAllPerMode = useCallback((checked, version, mode) => {
        const gameCopy = { ...game };
        gameCopy.structure = [...gameCopy.structure]; // this forces a re-render of structure component
        modeToggle(mode, version, checked);
        setGame(gameCopy);
    }, [game, setGame]); // should only be redefined when game OR setGame is updated

    // FUNCTION 12: handleStructureSubmit - code that is executed when the user submits the structure form
    // PRECONDITIONS (1 parameter):
    // 1.) e: the event object generated when the user submits the form
    // POSTCONDITIONS (2 possible outcomes):
    // if the form is validated, we add the new versions to the system, and update any submissions (if necessary)
    // if the form is not validated, we return early, and render an error message to the user
    const handleStructureSubmit = useCallback(e => {
        e.preventDefault();
        
        const newVersions = versions.filter(version => !version.id);
        console.log(newVersions);
    }, [versions]); // should only be redefined when versions is updated

    return { 
        game,
        games,
        versions,
        queryGames,
        switchGame,
        handleVersionsChange,
        handleNewVersionSubmit,
        onVersionCheck,
        toggleAll,
        toggleAllPerCategory,
        toggleAllPerMode,
        handleStructureSubmit
    };
};

/* ===== EXPORTS ===== */
export default Versions;