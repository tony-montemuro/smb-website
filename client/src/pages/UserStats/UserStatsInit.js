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
    const [loading, setLoading] = useState(true);
    const [title, setTitle] = useState(null);
    const [user, setUser] = useState(null);
    const [medals, setMedals] = useState([]);
    const [medalsMisc, setMedalsMisc] = useState([]);
    const [totals, setTotals] = useState([]);
    const [totalsMisc, setTotalsMisc] = useState([]);
    const [selectedRadioBtn, setSelectedRadioBtn] = useState("main");

    // function used to make sure a valid user is being viewed
    const checkForUser = async () => {
        try {
            let { data: profiles, error } = await supabase
                .from('profiles')
                .select('id, username, country, avatar_url');

            if (error) {
                throw error;
            }
            
            let validUser = false;

            // now, go through the list of profiles, and ensure userId is found
            for (let profile of profiles) {
                if (userId === profile.id) {
                    validUser = true;
                    setUser(profile);
                }
            }

            // if it is not found, validUser will remain false, and page will navigate to home
            if (!validUser) {
                navigate("/");
            }
        } catch (error) {
            alert(error.message);
        }
    }

    // function used to check for valid path. if invalid, user will be redirected to home page
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

    // helper function which simply checks for equality of medal sets. this will almost always return false
    const equalityCheck = (currSet, nextSet) => {
        return currSet.platinum === nextSet.platinum && currSet.gold === nextSet.gold && currSet.silver === nextSet.silver && currSet.bronze === nextSet.bronze;
    }

    // function that will query the medal and totalizer tables based on the game and mode parameters
    const performQuery = async (game, mode) => {
        // First, query the medal table
        try {
            let { data: medalsList, error, status } = await supabase
                .from(`${game}_${mode}_medal_table`)
                .select(`
                    user_id,
                    profiles:user_id ( id, username, country, avatar_url ),
                    platinum,
                    gold,
                    silver,
                    bronze
                `)
                .order("platinum", { ascending: false })
                .order("gold", { ascending: false })
                .order("silver", { ascending: false })
                .order("bronze", { ascending: false });

            // if there was an error querying data, throw error
            if (error && status !== 406) {
                throw error;
            }

            // variables used to determine position of each submission
            let trueCount = 1;
            let posCount = trueCount;

            // now, iterate through each record, and calculate the position.
            // simplify each object. also, if the current user has a submission,
            // set the form values equal to the submission
            for (let i = 0; i < medalsList.length; i++) {
                const medalSet = medalsList[i];
                medalSet["Position"] = posCount;
                trueCount++;
                if (i < medalSet.length-1 && equalityCheck(medalSet, medalsList[i+1])) {
                    posCount = trueCount;
                }

                // simplify
                medalSet["Name"] = medalSet.profiles.username;
                medalSet["Country"] = medalSet.profiles.country;
                medalSet["Avatar_URL"] = medalSet.profiles.avatar_url;
                delete medalSet.profiles;
            }

            // finally, add the user's particular row into the medals state
            let userMedals = medalsList.find(item => item.user_id === userId);
            if (typeof userMedals === "undefined") {
                userMedals = {hasData: false};
            } else {
                userMedals.hasData = true;
            }
            userMedals.game = game;
            userMedals.mode = mode;
            game.includes("misc") ? setMedalsMisc(medalsMisc => [...medalsMisc, userMedals]) : setMedals(medals => [...medals, userMedals]);

        } catch (error) {
            console.log(error);
            alert(error.message);
        }

        // Now, query the totals table
        try {
            let { data: totals, status, error } = await supabase
                .from(`${game}_${mode}_total`)
                .select(`
                    user_id,
                    profiles:user_id ( id, username, country, avatar_url ),
                    total
                `)
                .order("total", { ascending: false });

            if (error && status !== 406) {
                throw error;
            }

            // variables used to determine position of each submission
            let trueCount = 1;
            let posCount = trueCount;

            // now, iterate through each record, and calculate the position.
            // simplify each object. also, if the current user has a submission,
            // set the form values equal to the submission
            for (let i = 0; i < totals.length; i++) {
                const total = totals[i];
                total["Position"] = posCount;
                trueCount++;
                if (i < totals.length-1 && totals[i+1]["total"] !== total["total"]) {
                    posCount = trueCount;
                }

                // simplify
                total["Name"] = total.profiles.username;
                total["Country"] = total.profiles.country;
                total["Avatar_URL"] = total.profiles.avatar_url;
                delete totals[i].profiles;
            }

            // finally, add the user's particular total into the totals state
            let userTotal = totals.find(item => item.user_id === userId);
            if (typeof userTotal === "undefined") {
                userTotal = {hasData: false};
            } else {
                userTotal.hasData = true;
            }
            userTotal.game = game;
            userTotal.mode = mode;
            game.includes("misc") ? setTotalsMisc(totalsMisc => [...totalsMisc, userTotal]) : setTotals(totals => [...totals, userTotal]);

        } catch (error) {
            console.log(error);
            alert(error.message);
        }
    }

    // function that makes the calls to medal and total tables for each category
    const queryMedalsAndTotals = async () => {
        const games = [abb, `${abb}_misc`];
        const modes = ["score", "time"];
        for (const game of games) {
            for (const mode of modes) {
                performQuery(game, mode);
            }
        }
    }

    // function that will correctly sort either the medals or totals states, depending on the boolean
    // parameter 'isMedals'
    const sortData = async (isMedals, isMisc) => {
        let tempArr = new Array(2);
        let stateArr;
        if (isMisc) {
            stateArr = isMedals ? medalsMisc : totalsMisc;
        } else {
            stateArr = isMedals ? medals : totals;
        }
        for (const obj of stateArr) {
            if (obj.mode === "score") {
                tempArr[0] = obj
            } else {
                tempArr[1] = obj;
            }
        }
        if (isMisc) {
            isMedals ? setMedalsMisc(tempArr) : setTotalsMisc(tempArr);
        } else {
            isMedals ? setMedals(tempArr) : setTotals(tempArr);
        }
    }

    // function used to check whether a radio button is selected or not
    const isRadioSelected = (val) => {
        return val === selectedRadioBtn;
    }

    // function that executes when a radio button is clicked
    const handleRadioClick = (e) => {
        console.log(e.target.value);
        setSelectedRadioBtn(e.target.value);
    }

    return { loading,
            title, 
            user, 
            medals, 
            totals, 
            medalsMisc, 
            totalsMisc,
            selectedRadioBtn,
            setLoading, 
            checkPath, 
            queryMedalsAndTotals, 
            sortData,
            isRadioSelected,
            handleRadioClick };
}

export default UserStatsInit;