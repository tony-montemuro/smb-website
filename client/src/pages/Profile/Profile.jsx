/* ===== IMPORTS ===== */
import "./Profile.css";
import { MessageContext, UserContext } from "../../utils/Contexts";
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AvatarInfoForm from "./AvatarInfoForm.jsx";
import EmailInfoForm from "./EmailInfoForm.jsx";
import ProfileLogic from "./Profile.js";
import UserInfoForm from "./UserInfoForm.jsx";

function Profile({ imageReducer }) {
    /* ===== VARIABLES ===== */
    const navigate = useNavigate();

    /* ===== CONTEXTS ===== */

    // user state from user context
    const { user } = useContext(UserContext);

    // add message function from message context
    const { addMessage } = useContext(MessageContext);

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
          addMessage("You cannot access this page.", "error");
          navigate("/");
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
    return user.id && countries ?
      <>

        { /* Profile header */ }
        <div className="profile-header">
          <h1>Profile Settings</h1>
        </div>

        { /* Profile body - render user info form, avatar info form, and email info form */ }
        <div className="profile-body"> 

          { /* Profile left - render the user info form */ }
          <div className="profile-left">
            <UserInfoForm countries={ countries } />
          </div>

          { /* Profile right - render the avatar info form, and email info form */ }
          <div className="profile-right">
            <AvatarInfoForm imageReducer={ imageReducer } />
            <EmailInfoForm />
          </div>
            
        </div>

    </>
  :
        
    // Loading component
    <p>Loading...</p>
};

/* ===== EXPORTS ===== */
export default Profile;