/* ===== IMPORTS ===== */
import { useState } from "react";
import PostRead from "../../database/read/PostRead";
import PageControls from "../../components/PageControls/PageControls.js";

const News = () => {
    /* ===== STATES ===== */
    const [posts, setPosts] = useState({ data: undefined, total: 9999999999 }); // set total to some arbitrarily large number for now

    /* ===== FUNCTIONS ===== */

    // database functions
    const { queryPosts } = PostRead();

    // helper functions
    const { getStartAndEnd } = PageControls();

    // FUNCTION 1: getPosts - retrieve posts ordered from most to least recent, and update the posts state
    // PRECONDITIONS (2 parameters):
    // 1.) num: an integer representing the number of pages that should be retrieved
    // 2.) pageNumber: the page number the user is currently on
    // POSTCONDITIONS (1 possible outcome):
    // the posts are retrieved, and the posts state is updated by calling setPosts() function
    const getPosts = async (num, pageNumber) => {
        // first, compute the range of posts to grab based on the parameters
        const { start, end } = getStartAndEnd(num, pageNumber);

        // then, we can grab the posts given our range, as well as the total number of posts
        const { postList, count } = await queryPosts(start, end);
        
        // next, split each post body into "lines", so that formatting can be preserved according to new line characters
        for (let post of postList) {
            post.body = post.body.split("\n");
        }

        // finally, update the posts state hook
        setPosts({ 
            data: postList,
            total: count
        });
    };

    return { posts, getPosts };
};

/* ===== EXPORTS ===== */
export default News;