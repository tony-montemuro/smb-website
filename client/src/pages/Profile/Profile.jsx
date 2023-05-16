/* ===== IMPORTS ===== */
import "./Profile.css";
import { Link } from "react-router-dom";
import { StaticCacheContext, UserContext } from "../../Contexts";
import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ProfileLogic from "./Profile.js";
import UserInfoForm from "./UserInfoForm";
import AvatarInfoForm from "./AvatarInfoForm";

function Profile({ imageReducer }) {
    /* ===== VARIABLES ===== */
    const navigate = useNavigate();

    /* ===== CONTEXTS ===== */

    // static cache state from static cache context & user state from user context 
    const { staticCache } = useContext(StaticCacheContext);
    const { user } = useContext(UserContext);

    /* ===== FUNCTIONS ===== */

    // states and functions from the init file
    const { 
        userForm,
        avatarForm,
        initForms,
        handleChange,
        updateUserInfo,
        avatarSubmit,
        signOutUser
    } = ProfileLogic();

    /* ===== EFFECTS ===== */

    // code that is executed when the page loads, or when the staticCache object is updated
    useEffect(() => {
        if (staticCache.countries.length > 0 && user.id !== undefined) {
          // if not user.id (meaning user is null), current user is not authenticated. thus, deny
          // access to this page.
          if (!user.id) {
            console.log("Error: Invalid access.");
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
                <UserInfoForm form={ userForm } handleChange={ handleChange } formSubmit={ updateUserInfo } />
                <AvatarInfoForm profileId={ userForm.user.id } form={ avatarForm } formSubmit={ avatarSubmit } imageReducer={ imageReducer } />
            </div>

            {/* Profile footer */}
            <div className="profile-footer">

                { /* Footer header */ }
                <h2>Options</h2>

                { /* Button to navigate to the user's page */ }
                <Link to={ `/user/${ userForm.user.id }` }>
                    <button>View Profile</button>
                </Link>

                { /* Button to sign the user out */ }
                <button onClick={ signOutUser }> Sign Out</button>
            </div>
      </>
    :
        
        // Loading component
        <p>Loading...</p>
};

/* ===== EXPORTS ===== */
export default Profile;