/* ===== IMPORTS ===== */
import { useEffect, useState } from "react";
import styles from "./News.module.css";
import Items from "../../components/Items/Items.jsx";
import Loading from "../../components/Loading/Loading.jsx";
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
  return (
    <div className={ styles.news }>

      {/* News header - Render information about this page */}
      <h1>News</h1>
      <p>Below is the list of all news posts created by SMB Elite administrators, ordered from most recent to least recent.</p>

      { /* News body - Render each post */ }
      { posts.data ?
        <Items items={ posts.data } emptyMessage="No posts exist!">
          { posts.data.map(post => {
            return <NewsPost post={ post } key={ post.id } />;
          })}
          <PageControls 
            totalItems={ posts.total }
            itemsPerPage={ POSTS_PER_PAGE }
            pageNum={ pageNum }
            setPageNum={ setPageNum }
            itemName="Posts"
            useDropdown
          />
        </Items>
      :
        <Loading />
      }

    </div>
  );
};

/* ===== EXPORTS ===== */
export default News;