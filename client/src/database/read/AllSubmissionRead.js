/* ===== IMPORTS ===== */
import { MessageContext, StaticCacheContext } from "../../utils/Contexts";
import { supabase } from "../SupabaseClient";
import { useContext } from "react";
import GameHelper from "../../helper/GameHelper";

const AllSubmissionRead = () => {
    /* ===== CONTEXTS ===== */

    // add message function from message context
    const { addMessage } = useContext(MessageContext);

    // static cache state from static cache object
    const { staticCache } = useContext(StaticCacheContext);

    /* ===== FUNCTIONS ===== */

    // helper functions
    const { getGameCategories, getCategoryTypes } = GameHelper();

    // FUNCTION 1: queryRecentSubmissions - function that retrieves the 5 most recent submissions in the database, and returns them
    // PRECONDITIONS (1 parameter):
    // 1.) abb: a string value, representing a game's abb value. this is used to uniquely identify it. this value could be undefined:
    // in that case, the query will simply get the 5 most recent submissions. otherwise, the query will be filtered based on this parameter
    // POSTCONDITIONS (2 possible outcomes):
    // if the query is successful, the 5 most recent submissions from the database are returned, sorted from most recent to least recent
    // if the query is a failure, the user is alerted of the error, and an empty array is returned
    const queryRecentSubmissions = async abb => {
        // first, we define our query
        let query = supabase
            .from("all_submission")
            .select(`
                all_position,
                id,
                level (
                    category,
                    mode (
                        game (
                            abb,
                            name
                        )
                    ),
                    name,
                    timer_type
                ),
                position,
                profile (
                    country,
                    id,
                    username
                ),
                proof,
                record,
                score
            `)
            .limit(5)
            .order("id", { ascending: false });
            query = abb ? query.eq("game_id", abb) : query;

        try {
            // now, perform the query
            const { data: submissions, error } = await query;

            // error handling
            if (error) {
                throw error;
            }

            // if we made it here, let's just return data
            return submissions;

        } catch (error) {
            addMessage("Recent submissions failed to load.", "error");
            return [];
        };
    };

    // FUNCTION 2: queryFilteredSubmissions - given a game, level, category, and type boolean, grab the list of all submissions
    // that correspond to these filters, ordered from most recent to least recent
    // PRECONDITIONS (4 parameters):
    // 1.) abb: a string value, representing a game's abb value. this is used to uniquely identify it.
    // 2.) levelName: a string value, representing the name of a level.
    // 3.) profileId: an integer value, representing a user's profile id.
    // 4.) isScore: a boolean value. true if the submission is a score, false otherwise.
    // POSTCONDITIONS (2 possible outcomes):
    // if the query is successful, the submissions that pass through the filter from the database are returned, sorted from most recent
    // to least recent
    // if the query is a failure, the user is alerted of the error, and an empty array is returned
    const queryFilteredSubmissions = async (abb, levelName, profileId, isScore) => {
        try {
            const { data: submissions, error } = await supabase
                .from("all_submission")
                .select(`
                    all_position,
                    comment,
                    id,
                    level (
                        timer_type
                    ),
                    live,
                    monkey (id, monkey_name),
                    platform (id, platform_abb, platform_name),
                    position,
                    proof,
                    record,
                    region (id, region_name),
                    submission (
                        approved,
                        report (
                            creator_id, 
                            profile_id
                        )
                    ),
                    submitted_at
                `)
                .eq("level_id", levelName)
                .eq("profile_id", profileId)
                .eq("score", isScore)
                .eq("game_id", abb)
                .order("id", { ascending: false });
            
            // error handling
            if (error) {
                throw error;
            }

            // if we made it this far, simply return the data
            return submissions;

        } catch (error) {
            addMessage("Submission history failed to load.", "error");
            return [];
        }
    };

    // FUNCTION 3: query - an internal module function performs query to get ALL submissions for a game
    // PRECONDITIONS (3 parameters):
    // 1.) abb: a string value, representing a game's abb value. this is used to uniquely identify it.
    // POSTCONDITIONS (2 possible outcomes):
    // if the query is a success, an array of submissions belonging to the game (specified by abb),
    // ordered by level id, then record, then submission date, is returned
    // if the query is unsuccessful, the error is thrown to be handled by the caller function
    const query = async (abb) => {
        try {
            const { data: submissions, error, status } = await supabase
                .from("all_submission")
                .select(`
                    all_position,
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
                    monkey (id, monkey_name),
                    platform (id, platform_abb, platform_name),
                    position,
                    profile (id, username, country),
                    proof,
                    record,
                    region (id, region_name),
                    score,
                    submission (
                        approved,
                        report (creator_id)
                    ),
                    submitted_at
                `)
                .eq("game_id", abb);

            // error handling
            if (error && status !== 406) {
                throw error;
            }

            // now, sort the array first by the level.id field in descending order, then by the record field in descending order.
            // finally, by the submitted_at field ascending order, and return array
            submissions.sort((a, b) => {
                if (a.level.id !== b.level.id) {
                    return a.level.id - b.level.id;
                }
                if (b.record !== a.record) {
                    return b.record - a.record 
                }
                return a.submitted_at.localeCompare(b.submitted_at);
            });

            return submissions;

        } catch (error) {
            // error to be handled by caller function
            throw error;
        }
    };

    // FUNCTION 4: getCacheObject - given a large array of submission objects, convert to a cache object, and return it
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

    // FUNCTION 5: getSubmissions - the public facing function used to get a list of submissions given some parameters
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

    return { queryRecentSubmissions, queryFilteredSubmissions, getSubmissions2 };
};

/* ===== EXPORTS ===== */
export default AllSubmissionRead;