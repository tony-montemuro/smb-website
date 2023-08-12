/* ===== IMPORTS ===== */
import "./News.css";
import { useEffect, useState } from "react";
import NewsLogic from "./News.js";
import NewsPost from "./NewsPost";

function News() {
  /* ===== VARIABLES ===== */
  const POSTS_PER_PAGE = 10;

  /* ===== STATES & FUNCTIONS ===== */
  const [pageNum, setPageNum] = useState(1);

  // states and functions from the js file
  const { posts, getStartAndEnd, getPosts, getMaxPage } = NewsLogic();

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

        { /* News body bottom - render page controls here. NOTE: this should only render if the total number of pages is
        greater than the max number of posts per page */ }
        { posts.total > POSTS_PER_PAGE &&
          <div className="news-body-bottom">

            { /* News body page viewer - render the set of pages shown on the current page */ }
            <div className="news-body-page-viewer">
              Showing { (getStartAndEnd(POSTS_PER_PAGE, pageNum, posts.total).start)+1 } to&nbsp;
              { Math.min(((getStartAndEnd(POSTS_PER_PAGE, pageNum, posts.total).end)+1), posts.total) } of { posts.total } Posts
            </div>

            { /* News body page controls - render buttons to navigate to the previous and next page, as well as a dropdown for the
            user to select any valid page */ }
            <div className="news-body-page-controls">
              <button onClick={ () => setPageNum(pageNum-1) } disabled={ pageNum <= 1 }>Previous Page</button>
              <select value={ pageNum } onChange={ (e) => setPageNum(parseInt(e.target.value)) }>
                { [...Array(getMaxPage(POSTS_PER_PAGE)).keys()].map(num => {
                  return <option value={ num+1 } key={ num+1 }>{ num+1 }</option>;
                })}
              </select>
              <button onClick={ () => setPageNum(pageNum+1) } disabled={ pageNum >= getMaxPage(POSTS_PER_PAGE) }>Next Page</button>
            </div>

          </div>
        }
      </div>

    </div>
  :
    // Loading component
    <p>Loading...</p>;
};

/* ===== EXPORTS ===== */
export default News;