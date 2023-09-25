/* ===== IMPORTS ===== */
import { useState } from "react";
import PostRead from "../../database/read/PostRead";

const Home = () => {
    /* ===== STATES ===== */
    const [posts, setPosts] = useState(undefined);
 
    /* ===== FUNCTIONS ===== */

    // database functions
    const { queryRecentPosts } = PostRead();

    // FUNCTION 1: getPosts - retrieve 3 most recent submissions from database, and update the posts state
    // PRECONDITIONS (1 condition):
    // this function should be called when the Home component is first mounted
    // POSTCONDITIONS (1 possible outcome):
    // the most recent posts are retrieved, and the posts state is updated by calling setPosts() function
    const getPosts = async () => {
        // first, grab the posts
        const posts = await queryRecentPosts();
        
        // next, split each post body into "lines", so that formatting can be preserved according to new line characters
        for (let post of posts) {
            post.body = post.body.split("\n");
        }

        // finally, update the posts state hook
        setPosts(posts);
    };

    return { posts, getPosts };
};

/* ===== EXPORTS ===== */
export default Home;