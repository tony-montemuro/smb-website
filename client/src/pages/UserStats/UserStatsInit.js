import { useState } from "react";
import { supabase } from "../../components/SupabaseClient/SupabaseClient";
import { useNavigate } from "react-router-dom";

const UserStatsInit = () => {
    // variables
    const path = window.location.pathname;
    const pathArr = path.split("/");
    const userId = pathArr[2];
    const abb = pathArr[3];
    const navigate = useNavigate();

    // states
    const [title, setTitle] = useState(null);

    // function used to make sure a valid user is being viewed
    const checkForUser = async () => {
        try {
            let { data: profiles, error } = await supabase
                .from('profiles')
                .select('id');

            if (error) {
                throw error;
            }
            
            let validUser = false;
            console.log("Profiles: ");
            console.log(profiles);
            for (let profile of profiles) {
                if (userId === profile.id) {
                    validUser = true;
                }
            }

            if (!validUser) {
                navigate("/");
            }
        } catch (error) {
            alert(error.message);
        }
    }

    const checkPath = async () => {
        try {
            await checkForUser();
            let approvedGame = false;

            // now, query the list of games. if the current url matches any of these
            // it is an approved path
            let {data: games, error, status} = await supabase
                .from("games")
                .select("*");

            // if there was an error querying data, throw error
            if (error && status !== 406) {
                throw error;
            }

            // now, iterate through game list, and compare with the current abb variable
            games.forEach(game => {
                const gameAbb = game.abb;
                const gameTitle = game.name;
                if (abb === gameAbb) {
                    approvedGame = true;
                    setTitle(gameTitle);
                }
            });

            // if not approved, navigate back to home. otherwise, proceed.
            if (!approvedGame) {
                navigate("/");
            }

        } catch(error) {
            alert(error.message);
        }
    }

    return { title, userId, abb, checkPath };
}

export default UserStatsInit;