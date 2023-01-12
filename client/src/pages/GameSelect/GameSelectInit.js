import { useState } from "react";

const GameSelectInit = () => {
    /* ===== STATES ===== */
    const [loading, setLoading] = useState(true);
    const [gameLists, setGameLists] = useState({ main: [], custom: [] });

    /* ===== FUNCTIONS ===== */

    // function that takes the list of games, and splits it based on the custom boolean
    const splitGameList = games => {
        // split games
        let main = [], custom = [];
        games.forEach(game => game.custom ? custom.push(game) : main.push(game));

        // update react state hooks
        setGameLists({ main: main, custom: custom });
        setLoading(false);
        console.log(main);
        console.log(custom);
    };

    return { loading, gameLists, splitGameList };
};

export default GameSelectInit;