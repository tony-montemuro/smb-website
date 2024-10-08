/* ===== IMPORTS ===== */
import { useSearchParams } from "react-router-dom";
import { useState } from "react";
import GameHelper from "../../helper/GameHelper";
import GameRead from "../../database/read/GameRead.js";

const GameLayout = (game, setVersion) => {
    /* ===== VARIABLES ===== */
    const versionKey = "version";

    /* ===== FUNCTIONS ===== */

    // database functions
    const { queryGame } = GameRead();

    // helper functions
    const { cleanGameObject } = GameHelper();

    /* ===== STATES ===== */
    const [disableVersionDropdown, setDisableVersionDropdown] = useState(false);
    const [searchParams, setSearchParams] = useSearchParams();

    // FUNCTION 1: fetchGame - code that is executed when the GameLayout component mounts, to fetch the desired game data
    // PRECONDITIONS (1 parameter):
    // 1.) abb: a string corresponding to the primary key of a game in the database
    // POSTCONDITIONS (2 possible outcomes):
    // if the query is successful, a game object is simply returned
    // if the query is unsuccessful, an undefined object is simply returned
    const fetchGame = async abb => {
        try {
            const game = await queryGame(abb);
            cleanGameObject(game);
            return game;

        } catch (error) {
            return undefined;
        };
    };

    // FUNCTION 2: fetchVersion - code that is executed when the GameLayout component mounts; to determine version
    // based on game & `version` search param
    // PRECONDITIONS (1 parameter):
    // 1.) game: a game object which contains information about the game
    // POSTCONDITIONS (3 possible outcomes):
    // if the version search parameter is defined, and corresponds to a version of the game, return that version
    // if the version search parameter is defined, but does not correspond to a version of the game, return the final version,
    // if exists. otherwise, return undefined
    // if the version search parameter is undefined, return the final version, if exists. otherwise, undefined.
    const fetchVersion = game => {
        const versionParam = searchParams.get(versionKey);

        if (versionParam) {
            const version = game.version?.find(v => v.version === versionParam);
            if (version) {
                return version;
            } else {
                setSearchParams(searchParams.delete(versionKey));
            }
        }
       
        return game.version?.at(-1);
    };

    // FUNCTION 3: handleVersionChange - code that is executed when the user changes the game version
    // PRECONDITIONS (1 parameter):
    // 1.) e: the event object generated when the user selects a new version
    // POSTCONDITIONS (1 possible outcome):
    // the version is updated given the information in `e.target`
    const handleVersionChange = e => {
        // determine version
        const { value } = e.target;
        const id = parseInt(value);
        const version = game.version.find(version => version.id === id);

        // next, let's update version search param
        const params = Object.fromEntries(searchParams);
        setSearchParams({ ...params, version: version.version });

        // finally, update version state
        setVersion(version);
    }

    return { disableVersionDropdown, fetchGame, fetchVersion, handleVersionChange, setDisableVersionDropdown };
};

/* ===== EXPORTS ===== */
export default GameLayout;