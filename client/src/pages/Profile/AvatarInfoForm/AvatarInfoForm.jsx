/* ===== IMPORTS ===== */
import { useContext, useRef } from "react";
import { UserContext } from "../../../utils/Contexts";
import styles from "./AvatarInfoForm.module.css";
import Avatar from "../../../components/Avatar/Avatar.jsx";
import AvatarInfoFormLogic from "./AvatarInfoForm.js";
import Container from "../../../components/Container/Container.jsx";

function AvatarInfoForm({ imageReducer }) {
  /* ===== VARIABLES ===== */
  const IMG_LENGTH = 150;

  /* ===== CONTEXTS ===== */

  // user state from user context
  const { user } = useContext(UserContext);
  
  /* ===== STATES & VARIABLES ===== */
  const { form, submitAvatar } = AvatarInfoFormLogic();

  /* ===== REFS ===== */
  const avatarRef = useRef(null);

  /* ===== AVATAR INFO FORM COMPONENT ===== */
  return (
    <Container title="Upload Avatar" isLargeHeader={ false }>
      <form id={ styles.form } onSubmit={ (e) => submitAvatar(e, avatarRef, imageReducer) }>
        <span><b>Note:</b> Must be JPEG or PNG, and cannot exceed 5 MB. If your avatar does not update immediately, give it some time.</span>
        <Avatar profileId={ user.profile ? user.profile.id : null } size={ IMG_LENGTH } imageReducer={ imageReducer } />
        <div id={ styles.input }>
          <label htmlFor="avatar-update"></label>
          <input
            type="file"
            id="avatar-update"
            accept=".jpg,.jpeg,.png"
            ref={ avatarRef }
          />
        </div>
        { form.error && <b id={ styles.error }>Error: { form.error }</b> }
        <button id={ styles.button } type="submit" disabled={ form.uploading }>Save</button>
      </form>
    </Container>
  );
};

/* ===== EXPORTS ===== */
export default AvatarInfoForm;