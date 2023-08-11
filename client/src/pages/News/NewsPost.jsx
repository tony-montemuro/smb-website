/* ===== IMPORTS ===== */
import FrontendHelper from "../../helper/FrontendHelper";
import Username from "../../components/Username/Username";

function NewsPost({ post }) {
  /* ===== FUNCTIONS ===== */
  const { getTimeAgo } = FrontendHelper();

  /* ===== NEWS POST COMPONENT ===== */
  return (
    <div className="news-post">

      { /* Posts header - includes the name of the post, and information about the post */ }
      <div className="news-post-header">
        
        { /* Post title */ }
        <h2>{ post.title }</h2>

        { /* Post information */ }
        <span>
          <b>posted { getTimeAgo(post.posted_at) } by&nbsp;
          <Username country={ post.profile.country } profileId={ post.profile.id } username={ post.profile.username } /></b>
        </span>
      </div>

      { /* Post body - includes the body of the post, and a link (if there is one) */ }
      <div className="news-post-body">

        { /* Post body */ }
        { post.body.map((line, index) => {
          return <p key={ index }>{ line }</p>;
        })}

        { /* Post link */ }
        { post.link && post.link.length > 0 &&
          <a href={ post.link } target="_blank" rel="noopener noreferrer">{ post.link_description }</a>
        }

      </div>

    </div>
  );
};

/* ===== EXPORTS ===== */
export default NewsPost;