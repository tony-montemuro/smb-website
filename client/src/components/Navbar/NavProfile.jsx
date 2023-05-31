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
      <div className="nav-profile-avatar">
        <Link to={ `/user/${ user.profile.id }` } title="View Profile" >
          <Avatar profileId={ user.profile.id } size={ 60 } imageReducer={ imageReducer } />
        </Link>
      </div>
      <div className="nav-profile-details">
        <div className="nav-profile-username">
          <Username country={ user.profile.country.iso2 } profileId={ user.profile.id } username={ user.profile.username } />
        </div>
        <div className="nav-profile-links">
          <div className="nav-profile-link">
            <Link to="/profile">
              <ManageAccountsIcon titleAccess="Profile Settings" />
            </Link>
          </div>
          <div id="nav-profile-notifications" className="nav-profile-link">
            { user.notifications.length > 0 ?
              <Link to="/notifications">
                <span>{ user.notifications.length }</span>
                <NotificationsIcon titleAccess="Notifications" />
              </Link>
            :
              <Link to="/notifications">
                <NotificationsNoneOutlinedIcon titleAccess="Notifications" />
              </Link>
            }
          </div>
          { user.is_mod &&
            <div className="nav-profile-link">
              <Link to="/submissions">
                <ChecklistIcon titleAccess="Recent Submissions" />
              </Link>
            </div>
          }
          <div className="nav-profile-link">
            <button id="nav-profile-signout-btn" onClick={ signOut }>
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