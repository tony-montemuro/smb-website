/* ===== IMPORTS ===== */
import styles from "./News.module.css";
import FrontendHelper from "../../helper/FrontendHelper";
import Username from "../../components/Username/Username";

function NewsPost({ post }) {
  /* ===== FUNCTIONS ===== */
  const { getTimeAgo } = FrontendHelper();

  /* ===== NEWS POST COMPONENT ===== */
  return (
    <div className={ styles.post }>

      { /* Posts header - includes the name of the post, and information about the post */ }
      <h2>{ post.title }</h2>
      <span>
        <b>posted { getTimeAgo(post.posted_at) } by&nbsp;
        <Username profile={ post.profile } /></b>
      </span>

      <hr />

      { /* Post body - render the contents of the post, as well as a link, if one was included */ }
      <div className={ styles.body }>
        { post.body.map((line, index) => {
          return <p key={ index }>{ line }</p>;
        })}
      </div>
      { post.link && post.link.length > 0 &&
        <a href={ post.link } target="_blank" rel="noopener noreferrer">{ post.link_description }</a>
      }

    </div>
  );
};

/* ===== EXPORTS ===== */
export default NewsPost;