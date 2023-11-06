/* ===== IMPORTS ===== */
import { ToastContext } from "../../utils/Contexts";
import { useContext, useState } from "react";
import RPCRead from "../../database/read/RPCRead";

const UserStats = () => {
    /* ===== CONTEXTS ===== */

    // add message function from toast context
    const { addMessage } = useContext(ToastContext);

    /* ===== STATES ===== */
    const [stats, setStats] = useState(undefined);

    /* ===== FUNCTIONS ===== */

    // database functions
    const { getTotals, getMedals, getUserRankings } = RPCRead();

    // FUNCTION 1: fetchUserStats - given path information & game object, fetch the stats object
    // PRECONDITIONS (3 parameters):
    // 1.) game: an object containing information about the game defined in the path
    // 2.) profileId: an integer representing the id of the user who's info we want to query
    // 3.) category: the current category. category is fetched from the URL
    // 4.) type: the current type, either "time" or "score". type is fetched from the URL
    // POSTCONDITIONS (1 possible outcome):
    // if all queries succeed, we generate two separate userStats objects. these two objects are then combined to form 'stats',
    // a single object which contains both user stats objects. the setStats() function is called to update the stats object
    // if the submissions fail to be retrieved, an error message is rendered to the user, and the stats state is NOT updated, 
    // leaving the UserStats component stuck loading
    const fetchUserStats = async (game, profileId, category, type) => {
        // first, reset stats state to default value (undefined), unpack path parameter, and define our stats
        // collection objects
        setStats(undefined);

        try {
            // get create our array of promises, and make concurrent call to database for all user data we need
            let promises = [false, true].map(liveOnly => {
                return getTotals(game.abb, category, type, liveOnly);
            });
            promises.push(getMedals(game.abb, category, type));
            promises = promises.concat([false, true].map(liveOnly => {
                return getUserRankings(game.abb, category, type, liveOnly, profileId);
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
            setStats(stats);

        } catch (error) {
			addMessage("Failed to fetch user data. If refreshing the page does not work, the system may be experiencing an outage.", "error", 10000);
        };
    };

    return { 
        stats,
        fetchUserStats
    };
};

/* ===== EXPORTS ===== */
export default UserStats;