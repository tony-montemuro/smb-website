/* ===== IMPORTS ===== */
import "./News.css";
import { useEffect, useState } from "react";
import NewsLogic from "./News.js";
import NewsPost from "./NewsPost";
import PageControls from "../../components/PageControls/PageControls.jsx";

function News() {
  /* ===== VARIABLES ===== */
  const POSTS_PER_PAGE = 5;

  /* ===== STATES & FUNCTIONS ===== */
  const [pageNum, setPageNum] = useState(1);

  // states and functions from the js file
  const { posts, getPosts } = NewsLogic();

  /* ===== EFFECTS ===== */

  // code that is executed when the component first mounts, or when the pageNum changes
  useEffect(() => {
    getPosts(POSTS_PER_PAGE, pageNum);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageNum]);

  /* ===== NEWS COMPONENT ===== */
  return posts.data ?
    <div className="news">

      { /* News header - render the name of the page, as well as a short description */ }
      <div className="news-header">
        <h1>News</h1>
        <p>Below is the list of all news posts created by SMB Elite moderators, ordered from most recent to least recent.</p>
      </div>

      { /* News body - render each post */ }
      <div className="news-body">
        { posts.data.map(post => {
          return <NewsPost post={ post } key={ post.id } />;
        })}

        { /* Render pagination controls at the bottom of this container */ }
        <PageControls 
          totalItems={ posts.total }
          itemsPerPage={ POSTS_PER_PAGE }
          pageNum={ pageNum }
          setPageNum={ setPageNum }
          itemName={ "Posts" } 
        />

      </div>

    </div>
  :
    // Loading component
    <p>Loading...</p>;
};

/* ===== EXPORTS ===== */
export default News;