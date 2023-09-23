/* ===== IMPORTS ===== */
import { Link } from "react-router-dom";
import { useContext } from "react";
import { UserContext } from "../../utils/Contexts";
import AbcIcon from "@mui/icons-material/Abc";
import Avatar from "../Avatar/Avatar.jsx";
import LogoutIcon from "@mui/icons-material/Logout";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import NotificationsIcon from "@mui/icons-material/Notifications";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import ShieldRoundedIcon from '@mui/icons-material/ShieldRounded';
import Signout from "../../database/authentication/Signout";
import Username from "../Username/Username";

function NavProfile({ imageReducer }) {
  /* ===== CONTEXTS ===== */

  // user state & is moderator function from user context
  const { user, isModerator } = useContext(UserContext);

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
          <Username profile={ user.profile } />
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

            { user.notificationCount > 0 ?
              // If the user has one or more notifications, render the number of notifications next to a full bell
              <Link to="/notifications">
                <span>{ user.notificationCount }</span>
                <NotificationsIcon titleAccess="Notifications" />
              </Link>
            :
              // Otherwise, render an empty bell
              <Link to="/notifications">
                <NotificationsNoneOutlinedIcon titleAccess="Notifications" />
              </Link>
            }

          </div>

          { /* Administrator hub link - icon that links to the administrator hub page (for admins only) */ }
          { user.profile.administrator &&
            <div className="nav-profile-link">
              <Link to="/administrator">
                <ShieldRoundedIcon titleAccess="Administrator Hub" />
              </Link>
            </div>
          }

          { /* Moderator hub link - icon that links to the moderation hub page (for admins + moderators only) */ }
          { isModerator() &&
            <div className="nav-profile-link">
              <Link to="/moderator">
                <AbcIcon titleAccess="Moderator Hub" />
              </Link>
            </div>
          }

          { /* Logout button - button that allows the user to log out of their account */ }
          <div className="nav-profile-link">
            <button type="button" className="nav-button" onClick={ signOut }>
              <LogoutIcon titleAccess="Sign Out" fontSize="small" />
            </button>
          </div>

        </div>
        
      </div>
    </div>
  );
};

/* ===== EXPORTS ===== */
export default NavProfile;