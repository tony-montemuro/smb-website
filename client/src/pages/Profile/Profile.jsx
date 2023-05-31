/* ===== IMPORTS ===== */
import "./Profile.css";
import { MessageContext, StaticCacheContext, UserContext } from "../../Contexts";
import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AvatarInfoForm from "./AvatarInfoForm";
import EmailInfoForm from "./EmailInfoForm.jsx";
import ProfileLogic from "./Profile.js";
import UserInfoForm from "./UserInfoForm";

function Profile({ imageReducer }) {
    /* ===== VARIABLES ===== */
    const navigate = useNavigate();

    /* ===== CONTEXTS ===== */

    // static cache state from static cache context & user state from user context 
    const { staticCache } = useContext(StaticCacheContext);

    // user state from user context
    const { user } = useContext(UserContext);

    // add message function from message context
    const { addMessage } = useContext(MessageContext);

    /* ===== FUNCTIONS ===== */

    // states and functions from the init file
    const { 
        userForm,
        avatarForm,
        initForms,
        handleChange,
        updateUserInfo,
        avatarSubmit
    } = ProfileLogic();

    /* ===== EFFECTS ===== */

    // code that is executed when the page loads, or when the staticCache object is updated
    useEffect(() => {
        if (staticCache.countries.length > 0 && user.id !== undefined) {
          // if not user.id (meaning user is null), current user is not authenticated. thus, deny
          // access to this page.
          if (!user.id) {
            addMessage("You cannot access this page.", "error");
            navigate("/");
            return;
          }
    
          // call function to initialize both forms
          initForms();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [staticCache, user]);

    /* ===== PROFILE COMPONENT ===== */
    return userForm.user && userForm.countries ?
        <>

            { /* Profile header */ }
            <div className="profile-header">
                <h1>Edit Your Profile</h1>
            </div>

            { /* Profile body - render the two profile forms */ }
            <div className="profile-body"> 
                <div className="profile-left">
                    <UserInfoForm form={ userForm } handleChange={ handleChange } formSubmit={ updateUserInfo } />
                </div>
                <div className="profile-right">
                    <AvatarInfoForm profileId={ userForm.user.id } form={ avatarForm } formSubmit={ avatarSubmit } imageReducer={ imageReducer } />
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