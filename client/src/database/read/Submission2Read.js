/* ===== IMPORTS ===== */
import { StaticCacheContext } from "../../utils/Contexts";
import { supabase } from "../SupabaseClient";
import { useContext } from "react";
import GameHelper from "../../helper/GameHelper";

const Submission2Read = () => {
    /* ===== CONTEXTS ===== */

    // static cache state from static cache object
    const { staticCache } = useContext(StaticCacheContext);

    /* ===== FUNCTIONS ===== */

    // helper functions
    const { getGameCategories, getCategoryTypes } = GameHelper();

    // FUNCTION 1: query - an internal module function performs query to get ALL submissions for a game
    // PRECONDITIONS (3 parameters):
    // 1.) abb: a string value, representing a game's abb value. this is used to uniquely identify it.
    // POSTCONDITIONS (2 possible outcomes):
    // if the query is a success, an array of submissions belonging to the game (specified by abb),
    // ordered by level id, then profile id, then submission date, is returned
    // if the query is unsuccessful, the error is thrown to be handled by the caller function
    const query = async abb => {
        try {
            const { data: submissions, error, status } = await supabase
                .from("submission2")
                .select(`
                    all_position,
                    approve (
                        creator_id
                    ),
                    comment,
                    id,
                    level!inner (
                        category,
                        chart_type,
                        id,
                        name,
                        time,
                        timer_type
                    ),
                    live,
                    monkey (
                        id, 
                        monkey_name
                    ),
                    platform (
                        id, 
                        platform_abb, 
                        platform_name
                    ),
                    position,
                    profile (
                        id, 
                        username, 
                        country
                    ),
                    proof,
                    record,
                    region (
                        id, 
                        region_name
                    ),
                    report:report2 (
                        creator_id
                    ),
                    score,
                    submitted_at,
                    tas
                `)
                .eq("game_id", abb);

            // error handling
            if (error && status !== 406) {
                throw error;
            }

            // now, sort the array first by the level.id field in ascending order, then by the profile field in ascending order.
            // finally, by the submitted_at field descending order, and return array
            submissions.sort((a, b) => {
                if (a.level.id !== b.level.id) {
                    return a.level.id - b.level.id;
                }
                if (b.profile.id !== a.profile.id) {
                    return a.profile.id - b.profile.id 
                }
                return b.submitted_at.localeCompare(a.submitted_at);
            });

            return submissions;

        } catch (error) {
            // error to be handled by caller function
            throw error;
        }
    };

    // FUNCTION 2: getCacheObject - given a large array of submission objects, convert to a cache object, and return it
    // PRECONDITIONS (1 parameter):
    // 1.) abb: a string value, representing a game's abb value. this is used to uniquely identify it.
    // 2.) submissions: an array of submission objects fetched from the database
    // POSTCONDITIONS (1 possible outcome):
    // by performing various filters, we organize the submission data into an object, and return it
    const getCacheObject = (abb, submissions) => {
        // first, fetch game object from static cache
        const game = staticCache.games.find(game => game.abb === abb);

        // next, let's declare and define our cache object
        const cacheObject = { abb: abb };
        getGameCategories(game).forEach(category => {                   // for each category
            cacheObject[category] = {};
            getCategoryTypes(game, category).forEach(type => {          // for each type
                cacheObject[category][type] = submissions.filter(submission => {
                    return submission.level.category === category && submission.score === (type === "score"); 
                });
            });
        });

        // finally, return the object
        return cacheObject;
    };

    // FUNCTION 3: getSubmissions2 - the public facing function used to get a list of submissions given some parameters
    // PRECONDITIONS (4 parameters):
    // 1.) abb: a string value, representing a game's abb value. this is used to uniquely identify it.
    // 2.) category: a string value representing a valid category
    // 3.) type: a string value, either "score" or "time".
    // 4.) submissionCache: an object with two fields:
		// a.) cache: the cache object that actually stores the submission objects (state)
		// b.) setCache: the function used to update the cache
    // POSTCONDITIONS (3 possible outcomes):
    // if user is accessing already cached submissions, we can fetch this information from the submission cache.
    // if not, we query, and if the query is successful, we update the submission cache, and return the array of submissions
    // if not, we query, and if the query is unsuccessful, this function throws an error to be handled by the caller function
    const getSubmissions2 = async (abb, category, type, submissionCache) => {
        // initialize submissions object
        let cache = {};

        // we have two choices: fetch submissions from cache if they are already there, or query them, update cache, and return result
        if (submissionCache.cache.abb === abb) {
            cache = submissionCache.cache;
        } else {
            // attempt to query submissions. if the query is successful, we generate cache object, and update the cache
            try {
                const submissions = await query(abb);
                cache = getCacheObject(abb, submissions);
                submissionCache.setCache(cache);
            } 
            
            // in the event of an error, it will be thrown by the function to be handled by the caller function
            catch (error) {
                throw error;
            }
        }
        return cache[category][type];
    };

    // FUNCTION 4: getUnapproved2 - function that grabs all submissions that have not yet been approved [note: this function does NOT
    // cache submissions]
    // PRECONDITIONS: NONE
    // POSTCONDITIONS (2 possible outcomes, 1 return):
    // if the query is a success, an array containing all of the unapproved submissions will be returned
    // otherwise, this function will throw an error, which should be handled by the caller function
    const getUnapproved2 = async () => {
        try {
            const { data: unapproved, error } = await supabase
                .rpc("get_unapproved");

            // error handling
            if (error) {
                throw error;
            }

            // return the array of unapproved submissions
            return unapproved;

        } catch (error) {
            // error will be handled by caller function
            throw error;
        }
    };

    return { getSubmissions2, getUnapproved2 };
};

/* ===== EXPORTS ===== */
export default Submission2Read;