/* ===== IMPORTS ===== */
import "./Profile.css";
import { MessageContext, StaticCacheContext, UserContext } from "../../utils/Contexts";
import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AvatarInfoForm from "./AvatarInfoForm.jsx";
import EmailInfoForm from "./EmailInfoForm.jsx";
import UserInfoForm from "./UserInfoForm.jsx";

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
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [staticCache, user]);

    /* ===== PROFILE COMPONENT ===== */
    return user.id && staticCache.countries.length > 0 ?
        <>

            { /* Profile header */ }
            <div className="profile-header">
                <h1>Profile Settings</h1>
            </div>

            { /* Profile body - render user info form, avatar info form, and email info form */ }
            <div className="profile-body"> 

                { /* Profile left - render the user info form */ }
                <div className="profile-left">
                    <UserInfoForm />
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