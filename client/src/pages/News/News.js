/* ===== IMPORTS ===== */
import { useState } from "react";
import PostRead from "../../database/read/PostRead";

const News = () => {
    /* ===== STATES ===== */
    const [posts, setPosts] = useState({ data: undefined, total: 9999999999 }); // set total to some arbitrarily large number for now

    /* ===== FUNCTIONS ===== */

    // database functions
    const { queryPosts } = PostRead();

    // FUNCTION 1: getStartAndEnd - given the number of posts and page number, retrieve the start and end post indicies
    // PRECONDITIONS (2 parameters):
    // 1.) num: an integer representing the max number of pages that should exist on each page 
    // 2.) pageNumber: the page number the user is currently on
    // POSTCONDITIONS (2 possible returns, 1 possible outcome):
    // two variables are returned
    // a.) start: the index of the first post on the page
    // b.) end: the index of the last post on the page
    const getStartAndEnd = (num, pageNumber) => {
        const start = num*(pageNumber-1);
        const end = (num*pageNumber)-1;
        return { start: start, end: end };
    };

    // FUNCTION 2: getPosts - retrieve posts ordered from most to least recent, and update the posts state
    // PRECONDITIONS (2 parameters):
    // 1.) num: an integer representing the number of pages that should be retrieved
    // 2.) pageNumber: the page number the user is currently on
    // POSTCONDITIONS (1 possible outcome):
    // the posts are retrieved, and the posts state is updated by calling setPosts() function
    const getPosts = async (num, pageNumber) => {
        // first, compute the range of posts to grab based on the parameters
        const { start, end } = getStartAndEnd(num, pageNumber, posts.total);

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

    // FUNCTION 3: getMaxPage - function that returns the max number of pages, given the total # of posts & number of posts
    // per page
    // PRECONDITIONS (1 parameter):
    // 1.) num - an integer representing the number of posts per page
    // POSTCONDITIONS (1 possible outcome):
    // using these two values, the max page number is returned
    const getMaxPage = num => {
        return Math.ceil(posts.total/num);
    };

    return { posts, getStartAndEnd, getPosts, getMaxPage };
};

/* ===== EXPORTS ===== */
export default News;