/* ===== IMPORTS ===== */
import { Link } from "react-router-dom";
import { useContext } from "react";
import { UserContext } from "../../Contexts";
import Avatar from "../Avatar/Avatar.jsx";
import ChecklistIcon from "@mui/icons-material/Checklist";
import LogoutIcon from "@mui/icons-material/Logout";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import NotificationsIcon from "@mui/icons-material/Notifications";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import Signout from "../../database/authentication/Signout";
import Username from "../Username/Username";

function NavProfile({ imageReducer }) {
  /* ===== CONTEXTS ===== */

  // user state from user context
  const { user } = useContext(UserContext);

  /* ===== FUNCTIONS ===== */

  // database functions
  const { signOut } = Signout();

  /* ===== NAV PROFILE COMPONENT ===== */
  return ( 
    <div className="nav-profile">

      { /* Nav profile avatar: simply render the current user's avatar, which should link to the page to view their profile */ }
      <div className="nav-profile-avatar">
        <Link to={ `/user/${ user.profile.id }` } title="View Profile" >
          <Avatar profileId={ user.profile.id } size={ 60 } imageReducer={ imageReducer } />
        </Link>
      </div>

      { /* Nav profile details: includes the user's username, and profile links  */ }
      <div className="nav-profile-details">

        { /* Username: render the user's username */ }
        <div className="nav-profile-username">
          <Username country={ user.profile.country.iso2 } profileId={ user.profile.id } username={ user.profile.username } />
        </div>

        { /* Links: all the user's different links */ }
        <div className="nav-profile-links">

          { /* Profile settings link - profile icon that links to the profile page */ }
          <div className="nav-profile-link">
            <Link to="/profile">
              <ManageAccountsIcon titleAccess="Profile Settings" />
            </Link>
          </div>

          { /* Notifications link - bell icon that links to the notifications page */ }
          <div className="nav-profile-link">
            { user.notifications.length > 0 ?
              // If the user has one or more notifications, render the number of notifications next to a full bell
              <Link to="/notifications">
                <span>{ user.notifications.length }</span>
                <NotificationsIcon titleAccess="Notifications" />
              </Link>
            :
              // Otherwise, render an empty bell
              <Link to="/notifications">
                <NotificationsNoneOutlinedIcon titleAccess="Notifications" />
              </Link>
            }
          </div>

          { /* Recent submissions link - list icon that links to the recent submissions page (for moderators only) */ }
          { user.is_mod &&
            <div className="nav-profile-link">
              <Link to="/submissions">
                <ChecklistIcon titleAccess="Recent Submissions" />
              </Link>
            </div>
          }

          { /* Logout button - button that allows the user to log out of their account */ }
          <div className="nav-profile-link">
            <button type="button" id="nav-profile-signout-btn" onClick={ signOut }>
              <LogoutIcon titleAccess="Sign Out" />
            </button>
          </div>

        </div>
        
      </div>
    </div>
  );
};

/* ===== EXPORTS ===== */
export default NavProfile;