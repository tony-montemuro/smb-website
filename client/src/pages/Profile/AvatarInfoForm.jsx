/* ===== IMPORTS ===== */
import "./Profile.css";
import { useContext, useRef } from "react";
import { UserContext } from "../../Contexts";
import Avatar from "../../components/Avatar/Avatar.jsx";
import AvatarInfoFormLogic from "./AvatarInfoForm.js";

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
    <div className="profile-avatar-info">

      { /* Form header */ }
      <h2>Update Avatar</h2>
      <p><b>Note:</b> Must be JPEG or PNG, and cannot exceed 5 MB. If your avatar does not update immediately, give it some time.</p>

      { /* Avatar form */ }
      <form className="profile-avatar-form" onSubmit={ (e) => submitAvatar(e, avatarRef) }>

        { /* Render the user's current avatar */ }
        <Avatar profileId={ user.profile ? user.profile.id : null } size={ IMG_LENGTH } imageReducer={ imageReducer } />

        { /* Avatar field - a optional file field, where the user can upload their avatar */ }
        <label htmlFor="avatar-update"></label>
        <input
          type="file"
          id="avatar-update"
          accept=".jpg,.jpeg,.png"
          ref={ avatarRef }
        />

        { /* Form button: button users uses to complete the form. Will disable while the application processes the form. */ }
        <button disabled={ form.uploading }>Save</button>

        { /* If form.error is defined, there was an issue with the avatar the user uploaded. Render it here.  */ }
        { form.error && <p>{ form.error }</p> }

      </form>
    </div>
  );
};

/* ===== EXPORTS ===== */
export default AvatarInfoForm;