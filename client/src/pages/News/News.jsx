/* ===== IMPORTS ===== */
import "./News.css";
import { useEffect } from "react";
import NewsLogic from "./News.js";
import NewsPost from "./NewsPost";

function News() {
  /* ===== STATES & FUNCTIONS ===== */

  // states and functions from the js file
  const { posts, getPosts } = NewsLogic();

  /* ===== EFFECTS ===== */

  // code that is executed when the component first mounts
  useEffect(() => {
    getPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ===== NEWS COMPONENT ===== */
  return posts ?
    <div className="news">

      { /* News header - render the name of the page, as well as a short description */ }
      <div className="news-header">
        <h1>News</h1>
        <p>Below is the list of all news posts created by SMB Elite moderators, ordered from most recent to least recent.</p>
      </div>

      { /* News body - render each post */ }
      <div className="news-body">
        { posts.map(post => {
          return <NewsPost post={ post } key={ post.id } />;
        })}
      </div>

    </div>
  :
    // Loading component
    <p>Loading...</p>;
};

/* ===== EXPORTS ===== */
export default News;