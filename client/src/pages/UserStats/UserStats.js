/* ===== IMPORTS ===== */
import { MessageContext } from "../../utils/Contexts";
import { useContext, useState } from "react";
import { useSearchParams } from "react-router-dom";
import GameHelper from "../../helper/GameHelper";
import RPCRead from "../../database/read/RPCRead";

const UserStats = (decimalPlaces, setVersion) => {
    /* ===== CONTEXTS ===== */

    // add message function from message context
    const { addMessage } = useContext(MessageContext);

    /* ===== STATES ===== */
    const [stats, setStats] = useState(undefined);
    const [searchParams, setSearchParams] = useSearchParams();

    /* ===== FUNCTIONS ===== */

    // database functions
    const { getTotals, getMedals, getUserRankings } = RPCRead();

    // helper functions
    const { getDecimals } = GameHelper();

    // TODO: this is a fine temporary solution, but should be generalized better - need to rework timer system!
    // FUNCTION 1: determineDecimals - given the rankings object, determine the decimals of the category
    // PRECONDITIONS (1 parameter):
    // 1.) rankings: an object containing information about the user's ranking on every level in the category
    // POSTCONDITIONS (2 possible outcomes):
    // if even a single level exists with a `timer_type` ending in 'msec', set `decimalPlaces.current` to 3
    // otherwise, set `decimalPlaces.current` to 2
    const determineDecimals = rankings => {
        const levelSets = Object.values(rankings);
        let levels = [];

        levelSets.forEach(set => {
            levels = levels.concat(set.map(ranking => ranking.level));
        });

        decimalPlaces.current = getDecimals(levels);
    };

    // FUNCTION 2: fetchUserStats - given path information & game object, fetch the stats object
    // PRECONDITIONS (5 parameters):
    // 1.) game: an object containing information about the game defined in the path
    // 2.) profileId: an integer representing the id of the user who's info we want to query
    // 3.) category: the current category. category is fetched from the URL
    // 4.) type: the current type, either "time" or "score". type is fetched from the URL
    // 5.) version: an integer representing the id of the version who's submission we want to grab from
    // POSTCONDITIONS (1 possible outcome):
    // if all queries succeed, we generate two separate userStats objects. these two objects are then combined to form 'stats',
    // a single object which contains both user stats objects. the setStats() function is called to update the stats object
    // if the submissions fail to be retrieved, an error message is rendered to the user, and the stats state is NOT updated, 
    // leaving the UserStats component stuck loading
    const fetchUserStats = async (game, profileId, category, type, version) => {
        // first, reset stats state to default value (undefined), unpack path parameter, and define our stats
        // collection objects
        setStats(undefined);

        try {
            // get create our array of promises, and make concurrent call to database for all user data we need
            let promises = [false, true].map(liveOnly => {
                return getTotals(game.abb, category, type, liveOnly, version);
            });
            promises.push(getMedals(game.abb, category, type, version));
            promises = promises.concat([false, true].map(liveOnly => {
                return getUserRankings(game.abb, category, type, liveOnly, profileId, version);
            }));
            const [allTotals, liveTotals, medals, allRankings, liveRankings] = await Promise.all(promises);

            // next, we need to extract the total / medal objects belonginging to the user defined by `profileId`
            const allTotal = allTotals.find(total => total.profile.id === profileId);
            const liveTotal = liveTotals.find(total => total.profile.id === profileId);
            const medal = medals.find(medal => medal.profile.id === profileId);

            // create our stats object
            const stats = {
                all: {
                    medals: medal,
                    rankings: allRankings,
                    total: allTotal
                },
                live: {
                    medals: medal,
                    rankings: liveRankings,
                    total: liveTotal
                }
            };
            determineDecimals(allRankings);
            setStats(stats);

        } catch (error) {
			addMessage("Failed to fetch user data. If refreshing the page does not work, the system may be experiencing an outage.", "error", 10000);
        };
    };

    // FUNCTION 3: handleVersionChange - code that is executed when the user changes the game version
    // PRECONDITIONS (2 parameters):
    // 1.) e: the event object generated when the user selects a new version
    // 1.) game: an object containing information about the game defined in the path
    // POSTCONDITIONS (1 possible outcome):
    // the version is updated given the information in `e.target`
    const handleVersionChange = (e, game) => {
        // determine version
        const { value } = e.target;
        const id = parseInt(value);
        const version = game.versions.find(version => version.id === id);
       
        // next, update version search param
        const params = Object.fromEntries(searchParams);
        setSearchParams({ ...params, version: version.version });

        // finally, update version state
        setVersion(version);
    }

    return { 
        stats,
        fetchUserStats,
        handleVersionChange
    };
};

/* ===== EXPORTS ===== */
export default UserStats;