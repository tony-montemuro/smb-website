/* ===== IMPORTS ===== */
import { MessageContext, UserContext } from "../../utils/Contexts";
import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();

  /* ===== CONTEXTS ===== */

  // add message function from message context
  const { addMessage } = useContext(MessageContext);

  // user state from user context
  const { user } = useContext(UserContext);

  /* ===== STATES & FUNCTIONS ===== */
  
  // states and functions from the js file
  const { form, handleChange, onPostSubmit } = PostLogic();

  // helper functions
  const { scrollToTop } = ScrollHelper();

  /* ===== EFFECTS ===== */

  // code that is executed when the component mounts
  useEffect(() => {
    // if moderator is not also an administrator, render an error message, and navigate back to home page
    if (!user.profile.administrator) {
      addMessage("Forbidden access.", "error");
      navigate("/");
      return;
    }
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
          id="title"
          inputProps={ { maxLength: TITLE_MAX_LENGTH } }
          label="Title"
          placeholder="Must be under 200 characters"
          onChange={ handleChange }
          required
          value={ form.values.title }
          variant="filled"
        />
        <TextField
          color="primary"
          fullWidth
          id="body"
          inputProps={ { maxLength: BODY_MAX_LENGTH } }
          label="Body"
          multiline
          placeholder="Must be under 3000 characters"
          rows={ BODY_HEIGHT }
          onChange={ handleChange }
          required
          value={ form.values.body }
          variant="filled"
        />
        <TextField 
          color="primary"
          fullWidth
          id="link"
          inputProps={ { maxLength: LINK_MAX_LENGTH } }
          label="Link"
          placeholder="Must be under 256 characters"
          onChange={ handleChange }
          type="url"
          value={ form.values.link }
          variant="filled"
        />
        <TextField 
          color={ form.error ? "error" : "primary" }
          error={ form.error !== undefined }
          fullWidth
          id="link_description"
          inputProps={ { maxLength: LINK_DESCRIPTION_MAX_LENGTH } }
          helperText={ form.error }
          label="Link Description"
          placeholder="Must be under 100 characters"
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