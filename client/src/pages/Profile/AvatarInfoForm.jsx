/* ===== IMPORTS ===== */
import "./Profile.css";
import { useRef } from "react";
import SimpleAvatar from "../../components/SimpleAvatar/SimpleAvatar";

function AvatarInfoForm({ form, formSubmit, imageReducer }) {
  /* ===== REFS ===== */
  const avatarRef = useRef(null);

  /* ===== AVATAR INFO FORM COMPONENT ===== */
  return (
    <div className="profile-avatar-info">

      { /* Form header */ }
      <h2>Update Avatar</h2>
      <p><b>Note:</b> Must be JPEG or PNG, and cannot exceed 5 MB. If your avatar does not update immediately, give it some time.</p>

      { /* Avatar form */ }
      <form className="profile-avatar-form" onSubmit={ (e) => formSubmit(e, avatarRef) }>

        { /* Render the user's current avatar */ }
        <div className="profile-avatar">
          <SimpleAvatar url={ form.avatar_url } size={ 150 } imageReducer={ imageReducer } />
        </div>

        { /* Avatar field - a optional file field, where the user can upload their avatar */ }
        <label htmlFor="avatar-update"></label>
        <input
          type="file"
          id="avatar-update"
          accept=".jpg,.jpeg,.png"
          ref={ avatarRef }
        />

        { /* Form button: button users uses to complete the form. Will disable while the application processes the form. */ }
        <button disabled={ form.updating }>Save</button>

        { /* If form.error is defined, there was an issue with the avatar the user uploaded. Render it here.  */ }
        { form.error && <p> { form.error }</p> }

      </form>
    </div>
  );
};

/* ===== EXPORTS ===== */
export default AvatarInfoForm;