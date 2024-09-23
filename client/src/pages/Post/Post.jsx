/* ===== IMPORTS ===== */
import { useEffect } from "react";
import styles from "./Post.module.css";
import PostLogic from "./Post.js";
import ScrollHelper from "../../helper/ScrollHelper";
import TextField from "@mui/material/TextField";

function Post() {
  /* ===== VARIABLES ===== */
  const TITLE_MAX_LENGTH = 200;
  const BODY_MAX_LENGTH = 3000;
  const BODY_HEIGHT = 25;
  const LINK_MAX_LENGTH = 256;
  const LINK_DESCRIPTION_MAX_LENGTH = 100;

  /* ===== STATES & FUNCTIONS ===== */
  
  // states and functions from the js file
  const { form, handleChange, onPostSubmit } = PostLogic();

  // helper functions
  const { scrollToTop } = ScrollHelper();

  /* ===== EFFECTS ===== */

  // code that is executed when the component mounts
  useEffect(() => {
    scrollToTop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ===== POST COMPONENT ===== */
  return (
    <div className={ styles.post }>
      <h1>Create Post</h1>

      { /* Post form: this is where the user can create their post - title, body, link, & link description */ }
      <form className={ styles.form } onSubmit={ onPostSubmit }>
        <TextField 
          color="primary"
          fullWidth
          helperText={ `${ form.values.title.length }/${ TITLE_MAX_LENGTH }` }
          id="title"
          inputProps={ { maxLength: TITLE_MAX_LENGTH } }
          label="Title"
          placeholder={ `Must be under ${ TITLE_MAX_LENGTH } characters` } 
          onChange={ handleChange }
          required
          value={ form.values.title }
          variant="filled"
        />
        <TextField
          color="primary"
          fullWidth
          helperText={ `${ form.values.body.length }/${ BODY_MAX_LENGTH }` }
          id="body"
          inputProps={ { maxLength: BODY_MAX_LENGTH } }
          label="Body"
          multiline
          placeholder={ `Must be under ${ BODY_MAX_LENGTH } characters` }
          rows={ BODY_HEIGHT }
          onChange={ handleChange }
          required
          value={ form.values.body }
          variant="filled"
        />
        <TextField 
          color="primary"
          fullWidth
          helperText={ `${ form.values.link.length }/${ LINK_MAX_LENGTH }` }
          id="link"
          inputProps={ { maxLength: LINK_MAX_LENGTH } }
          label="Link"
          placeholder={ `Must be under ${ LINK_MAX_LENGTH } characters` }
          onChange={ handleChange }
          type="url"
          value={ form.values.link }
          variant="filled"
        />
        <TextField 
          color={ form.error ? "error" : "primary" }
          error={ form.error !== undefined }
          fullWidth
          helperText={ form.error ? form.error : `${ form.values.link_description.length }/${ LINK_DESCRIPTION_MAX_LENGTH }` }
          id="link_description"
          inputProps={ { maxLength: LINK_DESCRIPTION_MAX_LENGTH } }
          label="Link Description"
          placeholder={ `Must be under ${ LINK_DESCRIPTION_MAX_LENGTH } characters` }
          onChange={ handleChange }
          value={ form.values.link_description }
          variant="filled"
        />

        { /* Post form submit - when pressed, the post will be uploaded */ }
        <button type="submit" disabled={ form.submitting }>Upload Post</button>

      </form>
    </div>
  );
};

/* ===== EXPORTS ===== */
export default Post;