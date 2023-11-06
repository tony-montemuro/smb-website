/* ===== IMPORTS ===== */
import { Outlet, useLocation, useNavigate, useParams } from "react-router-dom";
import { ProfileContext, ToastContext } from "../../utils/Contexts";
import { useContext, useEffect, useState } from "react"; 
import styles from "./UserLayout.module.css";
import Loading from "../Loading/Loading.jsx";
import StatsDirectory from "./StatsDirectory/StatsDirectory.jsx";
import UserLayoutLogic from "./UserLayout.js";
import UserOverview from "./UserOverview/UserOverview.jsx";

function UserLayout({ imageReducer }) {
  /* ===== VARIABLES ===== */
  const params = useParams();
  const location = useLocation();
  const { profileId } = params;
  const navigate = useNavigate();

  /* ===== CONTEXTS ===== */

  // add message function from toast context
  const { addMessage } = useContext(ToastContext)
  
  /* ===== STATES ===== */
  const [profile, setProfile] = useState(undefined);

  /* ===== FUNCTIONS ===== */
  const { fetchProfile } = UserLayoutLogic();

  /* ===== EFFECTS ===== */

  // code that is executed when the component mounts, or when the pathname is updated
  useEffect(() => {
    async function initProfile() {
      const profile = await fetchProfile(profileId);

      if (profile !== undefined) {
        // if profile is a null object, it means no profile exists that corresponds with `profileId`. we will print an error message,
        // and navigate to the home screen
        if (!profile) {
          addMessage("The requested user does not exist.", "error", 7000);
          navigate("/users");
          return;
        }

        // if we made it this far, update the profile state hook
        setProfile(profile);
      }
    };

    initProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  /* ===== USER LAYOUT COMPONENT ===== */ 
  return profile ?
    <ProfileContext.Provider value={ { profile } } >
      <div className={ styles.userLayout }>

        { /* User Layout Left - Sidebar user can use to navigate the user pages.  */ }
        <div className={ styles.left }>
          <UserOverview imageReducer={ imageReducer } />
          <StatsDirectory imageReducer={ imageReducer } />
        </div>

        { /* User layout content -  The actual page itself. */ }
        <div className={ styles.right } id="user-layout-right">
          <Outlet />
        </div>

      </div>
    </ProfileContext.Provider>
  :
    <Loading />
};  

/* ===== EXPORTS ===== */
export default UserLayout;