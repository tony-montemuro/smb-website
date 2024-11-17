/* ===== IMPORTS ===== */
import { useSearchParams } from "react-router-dom";
import { useState } from "react";
import GameHelper from "../../helper/GameHelper";
import GameRead from "../../database/read/GameRead.js";

const GameLayout = (game, setVersion) => {
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

    // FUNCTION 2: handleVersionChange - code that is executed when the user changes the game version
    // PRECONDITIONS (1 parameter):
    // 1.) versionId: an integer or string, representing the id of a version
    // POSTCONDITIONS (1 possible outcome):
    // the version is updated given `versionId`
    const handleVersionChange = versionId => {
        // determine version
        const id = parseInt(versionId); // parse in-case of string
        const version = game.version.find(version => version.id === id);

        // next, let's update version search param
        const params = Object.fromEntries(searchParams);
        setSearchParams({ ...params, version: version.version });

        // finally, update version state
        setVersion(version);
    }

    return { disableVersionDropdown, fetchGame, handleVersionChange, setDisableVersionDropdown };
};

/* ===== EXPORTS ===== */
export default GameLayout;