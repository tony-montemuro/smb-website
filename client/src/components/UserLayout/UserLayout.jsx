/* ===== IMPORTS ===== */
import "./UserLayout.css";
import { Link, Outlet, useNavigate, useParams } from "react-router-dom";
import { MessageContext, ProfileContext, StaticCacheContext } from "../../Contexts";
import { useContext, useEffect, useState } from "react";
import Avatar from "../Avatar/Avatar.jsx";
import UserStatsDirectory from "./UserStatsDirectory";

function UserLayout({ imageReducer }) {
  /* ===== VARIABLES ===== */
  const params = useParams();
  const { profileId } = params;
  const navigate = useNavigate();
  const IMG_WIDTH = 300;

  /* ===== CONTEXTS ===== */

  // static cache state from static cache context
  const { staticCache } = useContext(StaticCacheContext);

  // add message function from message context
  const { addMessage } = useContext(MessageContext);
  
  /* ===== STATES ===== */
  const [profile, setProfile] = useState(undefined);

  /* ===== EFFECTS ===== */

  // code that is executed when the component mounts
  useEffect(() => {
    if (staticCache.profiles.length > 0) {
      // see if profileId corresponds to a profile stored in cache
      const profiles = staticCache.profiles;
      const profile = profiles.find(row => row.id === parseInt(profileId));

      // if not, we will print an error message, and navigate to the home screen
      if (!profile) {
        addMessage("User does not exist.", "error");
        navigate("/");
        return;
      }

      // update the profile state hook
      setProfile(profile);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [staticCache]);

  /* ===== USER LAYOUT COMPONENT ===== */ 
  return profile &&
    <div className="user-layout">

      { /* User Layout Sidebar - Sidebar user can use to navigate the user pages.  */ }
      <div className="user-layout-sidebar">

        { /* User Layout Profile - Render general information about the user. */ }
        <div className="user-layout-profile">

          { /* User avatar and name - link back to the main user page. */ }
          <Link to={ `/user/${ profile.id }` }>
            <Avatar profileId={ profile.id } size={ IMG_WIDTH } imageReducer={ imageReducer }  />
            <h2>{ profile.username }</h2>
          </Link>

          { /* User country - render the user's country flag and name, if they exist. */ }
          { profile.country &&
            <div className="user-layout-country">
              <span className={ `fi fi-${ profile.country.iso2.toLowerCase() }` }></span>
              <p>&nbsp;{ profile.country.name }</p>
            </div>
          }

        </div>

        { /* Render navigation directory */ }
        <UserStatsDirectory imageReducer={ imageReducer } />

      </div>

      { /* User layout content -  The actual page itself. */ }
      <div className="user-layout-content">
        <ProfileContext.Provider value={ { profile } } >
          <Outlet />
        </ProfileContext.Provider>
      </div>

    </div>
};  

/* ===== EXPORTS ===== */
export default UserLayout;