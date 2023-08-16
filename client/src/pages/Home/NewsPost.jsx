/* ===== IMPORTS ===== */
import { useState } from "react";
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
    <div className="home-news-post">

      { /* Post title */ }
      <h2 onClick={ () => setViewPost(!viewPost) }>
        <span className="home-news-post-aligned-span">{ viewPost ? <ExpandLessRoundedIcon /> : <ExpandMoreRoundedIcon /> }</span> { post.title }
      </h2>

      { /* Post information */ }
      <span className="home-news-post-info">
        posted { getTimeAgo(post.posted_at) } by&nbsp; 
        <Username country={ post.profile.country } profileId={ post.profile.id } username={ post.profile.username } />
      </span>

      { /* If the viewPost state is set to true, render the body and link of the post (if it exists!) */ }
      { viewPost &&
        <div className="home-news-post-body">
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