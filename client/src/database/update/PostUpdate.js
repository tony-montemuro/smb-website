/* ===== IMPORTS ===== */
import { supabase } from "../SupabaseClient";

const PostUpdate = () => {
    /* ===== FUNCTIONS ===== */

    // FUNCTION 1: insertPost - function that, given a post object, inserts a post object to the database
    // PRECONDITIONS (1 parameter):
    // 1.) post: a post object, which contains all the necessary elements of a post
    // POSTCONDITIONS (2 possible outcomes):
    // if the query is successful, the post is added to the database, and the function simply returns
    // if the query is unsuccessful, the function throws an error, which should be handled by the caller function
    const insertPost = async post => {
        try {
            const { error } = await supabase
                .from("post")
                .insert(post);

            // error handling
            if (error) {
                throw error;
            }

        } catch (error) {
            // simply throw error, which should be handled by caller function
            throw error;
        }
    };

    return { insertPost };
};

/* ===== EXPORTS ===== */
export default PostUpdate;