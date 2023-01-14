import { useState } from "react";
import { useNavigate } from "react-router-dom";

const UserInit = () => {
    /* ===== VARIABLES ===== */
    const path = window.location.pathname;
    const pathArr = path.split("/");
    const userId = pathArr[2];
    const navigate = useNavigate();

    /* ===== STATES ===== */
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [games, setGames] = useState(null);

    /* ===== FUNCTIONS ===== */

    const init = async(games, profiles) => {
        // first, let's verify the user exists
        let currentUser = profiles.filter(row => row.id === userId);
        if (currentUser.length === 0) {
            console.log("Error: Invalid user.");
            navigate("/");
            return;
        } else {
            currentUser = currentUser[0];
        }
        
        // now, separate games based on the custom field
        let main = [], custom = [];
        games.forEach(game => game.custom ? custom.push(game) : main.push(game));

        // finally, update react state hooks
        setUser(currentUser);
        setGames({ main: main, custom: custom });
        setLoading(false);
    };

    return {  
        user,
        loading,
        games,
        init
    }
}

export default UserInit;