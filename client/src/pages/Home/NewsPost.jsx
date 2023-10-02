/* ===== IMPORTS ===== */
import { useState } from "react";
import styles from "./Home.module.css";
import ExpandLessRoundedIcon from "@mui/icons-material/ExpandLessRounded";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import FrontendHelper from "../../helper/FrontendHelper";
import Username from "../../components/Username/Username";

function NewsPost({ post }) {
  /* ===== STATES ===== */
  const [viewPost, setViewPost] = useState(false);

  /* ===== FUNCTIONS ===== */
  const { getTimeAgo } = FrontendHelper();

  /* ===== POST COMPONENT ===== */
  return (
    <div className={ styles.post }>

      { /* Post title */ }
      <h2 onClick={ () => setViewPost(!viewPost) }>
        <span className={ styles.postExpand }>{ viewPost ? <ExpandLessRoundedIcon /> : <ExpandMoreRoundedIcon /> }</span> { post.title }
      </h2>

      { /* Post information */ }
      <span className={ styles.postInfo }>
        posted { getTimeAgo(post.posted_at) } by&nbsp; 
        <Username profile={ post.profile } />
      </span>

      { /* If the viewPost state is set to true, render the body and link of the post (if it exists!) */ }
      { viewPost &&
        <div className={ styles.postBody }>
          { post.body.map((line, index) => {
            return <p key={ index }>{ line }</p>;
          })}
          { post.link && post.link.length > 0 &&
            <a href={ post.link } target="_blank" rel="noopener noreferrer">{ post.link_description }</a>
          }
        </div>
      }
      
    </div>
  );
};

/* ===== EXPORTS ===== */
export default NewsPost;