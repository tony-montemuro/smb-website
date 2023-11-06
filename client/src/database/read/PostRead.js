/* ===== IMPORTS ===== */
import { supabase } from "../SupabaseClient";

const PostRead = () => {
    /* ===== FUNCTIONS ===== */

    // FUNCTION 1: queryRecentPosts - function that retrieves the 3 most recent posts in the database, and returns them
    // PRECONDITIONS: NONE
    // POSTCONDITIONS (2 possible outcomes):
    // if the query is successful, the 3 most recent posts from the database are returned, sorted from most recent to least recent
    // if the query is a failure, throw an error, which should be handled by the caller function
    const queryRecentPosts = async () => {
        try {
            const { data: posts, error } = await supabase
                .from("post")
                .select(`
                    body,
                    id,
                    link,
                    link_description,
                    posted_at,
                    profile (
                        country,
                        id,
                        username
                    ),
                    title
                `)
                .limit(3)
                .order("id", { ascending: false });

            // error handling
            if (error) {
                throw error;
            }

            // if we made it this far, simply return the posts
            return posts;

        } catch (error) {
            // error should be handled by the caller function
            throw error;
        };
    };

    // FUNCTION 2: queryPosts - function that retrieves posts ordered from most recent to least recent
    // PRECONDITIONS (2 parameters):
    // 1.) start: an integer representing the index of the first post we should query
    // 2.) end: an integer representing the index of the last post we should query
    // POSTCONDITIONS (2 possible outcomes, 2 returns):
    // if the query is successful, the list of posts, as well as the number of total posts, is returned
    // if the query is a failure, throw an error, which should be handled by the caller function
    const queryPosts = async (start, end) => {
        try {
            const { data: postList, count, error } = await supabase
                .from("post")
                .select(`
                    body,
                    id,
                    link,
                    link_description,
                    posted_at,
                    profile (
                        country,
                        id,
                        username
                    ),
                    title
                `,
                { count: "exact" }
                )
                .range(start, end)
                .order("id", { ascending: false });

            // error handling
            if (error) {
                throw error;
            }

            // if we made it this far, return posts, as well as count
            return { postList: postList, count: count };

        } catch (error) {
            // error should be handled by the caller function
            throw error;
        };
    };

    return { queryRecentPosts, queryPosts };
};

/* ===== EXPORTS ===== */
export default PostRead;