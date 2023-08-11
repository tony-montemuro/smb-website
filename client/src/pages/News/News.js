/* ===== IMPORTS ===== */
import { useState } from "react";
import PostRead from "../../database/read/PostRead";

const News = () => {
    /* ===== STATES ===== */
    const [posts, setPosts] = useState(undefined);

    /* ===== FUNCTIONS ===== */

    // database functions
    const { queryPosts } = PostRead();

    // FUNCTION 2: getPosts - retrieve posts ordered from most to least recent, and update the posts state
    // PRECONDITIONS (1 condition):
    // this function should be called when the News component is first mounted
    // POSTCONDITIONS (1 possible outcome):
    // the posts are retrieved, and the posts state is updated by calling setPosts() function
    const getPosts = async () => {
        // first, grab the posts
        const posts = await queryPosts();
        
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
export default News;