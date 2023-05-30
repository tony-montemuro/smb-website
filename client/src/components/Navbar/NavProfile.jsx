/* ===== IMPORTS ===== */
import { Link } from "react-router-dom";
import { useContext } from "react";
import { UserContext } from "../../Contexts";
import Avatar from "../Avatar/Avatar.jsx";
import ChecklistIcon from "@mui/icons-material/Checklist";
import LogoutIcon from "@mui/icons-material/Logout";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import NotificationsIcon from "@mui/icons-material/Notifications";
import Signout from "../../database/authentication/Signout";

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
        <span>{ user.profile.username }</span>
        <div className="nav-profile-links">
          <Link to="/profile">
            <ManageAccountsIcon titleAccess="Edit Profile" />
          </Link>
          <Link to="/notifications">
            <NotificationsIcon titleAccess="Notifications" />
          </Link>
          { user.is_mod &&
            <Link to="/submissions">
              <ChecklistIcon titleAccess="Recent Submissions" />
            </Link>
          }
          <button id="signout-btn" onClick={ signOut }>
            <LogoutIcon titleAccess="Sign Out" />
          </button>
        </div>
      </div>
    </div>
  );
};

/* ===== EXPORTS ===== */
export default NavProfile;