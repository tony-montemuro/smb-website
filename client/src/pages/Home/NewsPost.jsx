/* ===== IMPORTS ===== */
import styles from "./NewsPost.module.css";
import FrontendHelper from "../../helper/FrontendHelper";
import Username from "../../components/Username/Username";

function NewsPost({ post }) {
  /* ===== FUNCTIONS ===== */
  const { getTimeAgo } = FrontendHelper();

  /* ===== POST COMPONENT ===== */
  return (
    <details className={ styles.post }>

      { /* Post summary - render the title of the post, as well as who posted it, and when */ }
      <summary>
        <span className={ styles.title }>
          { post.title }
        </span>
        <span className={ styles.info }>
          posted { getTimeAgo(post.posted_at) } by <Username profile={ post.profile } />
        </span>
      </summary>
      

      { /* Post body - render the contents of the post when the `details` tag has the `open` property */ }
      <div className={ styles.body }>
        { post.body.map((line, index) => {
          return <p key={ index }>{ line }</p>;
        })}
      </div>
      { post.link && post.link.length > 0 &&
        <a href={ post.link } target="_blank" rel="noopener noreferrer">{ post.link_description }</a>
      }
      
    </details>
  );
};

/* ===== EXPORTS ===== */
export default NewsPost;