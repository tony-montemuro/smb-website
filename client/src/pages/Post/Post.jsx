/* ===== IMPORTS ===== */
import "./Post.css";
import PostLogic from "./Post.js";

function Post() {
  /* ===== VARIABLES ===== */
  const NUM_ROWS = 20;

  /* ===== STATES & FUNCTIONS ===== */
  
  // states and functions from the js file
  const { form, handleChange, onPostSubmit } = PostLogic();

  /* ===== POST COMPONENT ===== */
  return (
    <div className="post">

      { /* Post header: render the name of the page, as well as a short description */ }
      <h1>Create Post</h1>

      <div className="post-form">

        { /* Post form: this is where the user can create their post */ }
        <form onSubmit={ onPostSubmit }>

          {/* Title input - allows user to enter a post title */}
          <div className="post-input-group">
            <label htmlFor="title">Title: </label>
            <input
              id="title" 
              type="text"
              value={ form.values.title }
              onChange={ handleChange }
            />

            { /* If the title has an error message, render it here. */ }
            { form.error.title && <p>Error: { form.error.title }</p> }
          </div>

          { /* Body body - allows user to write the body of the post */ }
          <div className="post-input-group">
            <label htmlFor="body">Body:</label>
            <textarea
              id="body"
              value={ form.values.body }
              onChange={ handleChange }
              rows={ NUM_ROWS }
            >
            </textarea>

            { /* If the body has an error message, render it here. */ }
            { form.error.body && <p>Error: { form.error.body }</p> }
          </div>

          { /* Link input - allows user to include a link with their post */ }
          <div className="post-input-group">
            <label htmlFor="link">Link (optional): </label>
            <input
              id="link" 
              type="url"
              value={ form.values.link }
              onChange={ handleChange }
            />

            { /* If the link has an error message, render it here. */ }
            { form.error.link && <p>Error: { form.error.link }</p> }
          </div>

          { /* Link description input - allows user to include a description of the link in their post */ }
          <div className="post-input-group">
            <label htmlFor="link_description">Link Description (optional): </label>
            <input
              id="link_description" 
              type="text"
              value={ form.values.link_description }
              onChange={ handleChange }
            />

            { /* If the link description has an error message, render it here. */ }
            { form.error.link_description && <p>Error: { form.error.link_description }</p> }
          </div>

          { /* Post form submit - when pressed, the post will be uploaded */ }
          <button type="submit" disabled={ form.submitting }>Upload Post</button>

        </form>
      </div>
    </div>
  );
};

/* ===== EXPORTS ===== */
export default Post;