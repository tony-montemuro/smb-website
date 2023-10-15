/* ===== IMPORTS ===== */
import "./UserLayout.css";
import { Outlet, useLocation, useNavigate, useParams } from "react-router-dom";
import { MessageContext, ProfileContext } from "../../utils/Contexts";
import { useContext, useEffect, useState } from "react"; 
import styles from "./UserLayout.module.css";
import UserLayoutLogic from "./UserLayout.js";
import UserOverview from "./UserOverview/UserOverview.jsx";
import UserStatsDirectory from "./UserStatsDirectory.jsx";

function UserLayout({ imageReducer }) {
  /* ===== VARIABLES ===== */
  const params = useParams();
  const location = useLocation();
  const { profileId } = params;
  const navigate = useNavigate();

  /* ===== CONTEXTS ===== */

  // add message function from message context
  const { addMessage } = useContext(MessageContext);
  
  /* ===== STATES ===== */
  const [profile, setProfile] = useState(undefined);

  /* ===== FUNCTIONS ===== */
  const { fetchProfile } = UserLayoutLogic();

  /* ===== EFFECTS ===== */

  // code that is executed when the component mounts, or when the pathname is updated
  useEffect(() => {
    async function initProfile() {
      // fetch profile from database
      const profile = await fetchProfile(profileId);

      // if profile is defined, we can proceed
      if (profile !== undefined) {
        // if profile is a null object, it means no profile exists that corresponds with `profileId`. we will print an error message,
        // and navigate to the home screen
        if (!profile) {
          addMessage("User does not exist.", "error");
          navigate("/");
          return;
        }

        // update the profile state hook
        setProfile(profile);
      }
    };

    initProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  /* ===== USER LAYOUT COMPONENT ===== */ 
  return profile &&
    <div className={ styles.userLayout }>

      { /* User Layout Left - Sidebar user can use to navigate the user pages.  */ }
      <div className={ styles.left }>
        <UserOverview profile={ profile } imageReducer={ imageReducer } />
        <UserStatsDirectory imageReducer={ imageReducer } profile={ profile } />
      </div>

      { /* User layout content -  The actual page itself. */ }
      <div className={ styles.right }>
        <ProfileContext.Provider value={ { profile } } >
          <Outlet />
        </ProfileContext.Provider>
      </div>

    </div>
};  

/* ===== EXPORTS ===== */
export default UserLayout;