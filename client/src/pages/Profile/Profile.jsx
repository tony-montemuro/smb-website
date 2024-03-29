/* ===== IMPORTS ===== */
import { MessageContext, UserContext } from "../../utils/Contexts";
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Profile.module.css";
import AvatarInfoForm from "./SimpleForms/AvatarInfoForm.jsx";
import EmailInfoForm from "./SimpleForms/EmailInfoForm.jsx";
import Loading from "../../components/Loading/Loading.jsx";
import PasswordForm from "./SimpleForms/PasswordForm.jsx";
import ProfileLogic from "./Profile.js";
import SignoutForm from "./SimpleForms/SignoutForm.jsx";
import UserInfoForm from "./UserInfoForm/UserInfoForm.jsx";

function Profile({ imageReducer }) {
  /* ===== VARIABLES ===== */
  const navigateTo = useNavigate();

  /* ===== CONTEXTS ===== */

  // add message function from message context
  const { addMessage } = useContext(MessageContext);

  // user state from user context
  const { user } = useContext(UserContext);

  /* ===== STATES ===== */
  const [countries, setCountries] = useState(undefined);

  /* ===== FUNCTIONS ===== */

  // functions from the js file
  const { fetchCountries } = ProfileLogic();

  /* ===== EFFECTS ===== */

  // code that is executed when the page loads, or when the user object is updated
  useEffect(() => {
    async function initProfile() {
      // if not user.id (meaning user is null), current user is not authenticated. thus, deny
      // access to this page.
      if (!user.id) {
        addMessage("Forbidden access.", "error", 5000);
        navigateTo("/");
        return;
      }

      // if we made it this far, fetch list of countries from database, and update countries state
      const countries = await fetchCountries();
      setCountries(countries);
    }

    if (user.id !== undefined) {
      initProfile();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  /* ===== PROFILE COMPONENT ===== */
  return user.id ?
    <div className={ styles.profile }>
      <h1>Profile Settings</h1>
      <div className={ styles.body }> 

        { /* Profile left - render the user info form */ }
        <div className={ styles.right }>
          <UserInfoForm countries={ countries } />
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