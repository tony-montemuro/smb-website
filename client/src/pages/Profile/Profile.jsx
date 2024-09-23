/* ===== IMPORTS ===== */
import { MessageContext, UserContext } from "../../utils/Contexts";
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Profile.module.css";
import AvatarInfoForm from "./Forms/AvatarInfoForm.jsx";
import Container from "../../components/Container/Container.jsx";
import EmailInfoForm from "./Forms/EmailInfoForm.jsx";
import Loading from "../../components/Loading/Loading.jsx";
import PasswordForm from "./Forms/PasswordForm.jsx";
import SignoutForm from "./Forms/SignoutForm.jsx";
import UserInfoForm from "../../components/UserInfoForm/UserInfoForm.jsx";

function Profile({ imageReducer }) {
  /* ===== VARIABLES ===== */
  const navigateTo = useNavigate();

  /* ===== CONTEXTS ===== */

  // add message function from message context
  const { addMessage } = useContext(MessageContext);

  // user state from user context
  const { user } = useContext(UserContext);

  /* ===== STATES ===== */
  const [submitting, setSubmitting] = useState(false);

  /* ===== EFFECTS ===== */

  // code that is executed when the page loads, or when the user object is updated
  useEffect(() => {
    // if user.id is not undefined, and not user.id (meaning user is null), current user is not authenticated.
    // thus, deny access to this page.
    if (user.id !== undefined && !user.id) {
      addMessage("Forbidden access.", "error", 5000);
      navigateTo("/");
      return;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  /* ===== PROFILE COMPONENT ===== */
  return user.id ?
    <div className={ styles.profile }>
      <h1>Profile Settings</h1>
      <div className={ styles.body }> 

        { /* Profile left - render the user info form */ }
        <div className={ styles.left }>
          <Container title={ `${ user.profile ? "Update " : "" }Profile Information` }>
            <UserInfoForm 
              submitting={ submitting }
              setSubmitting={ setSubmitting }
            />
          </Container>
        </div>

        { /* Profile right - render the avatar info form, and email info form */ }
        <div className={ styles.right }>
          { user.profile && <AvatarInfoForm imageReducer={ imageReducer } /> }
          <EmailInfoForm />
          <PasswordForm />
          <SignoutForm />
        </div>
          
      </div>
    </div>
  :
    <Loading />;
};

/* ===== EXPORTS ===== */
export default Profile;