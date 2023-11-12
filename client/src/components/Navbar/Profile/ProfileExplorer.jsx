/* ===== IMPORTS ===== */
import { Link } from "react-router-dom";
import { useContext } from "react";
import { UserContext } from "../../../utils/Contexts";
import styles from "./Profile.module.css";
import Avatar from "../../Avatar/Avatar.jsx";
import LogoutIcon from "@mui/icons-material/Logout";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import ModIcon from "../../../assets/svg/Icons/ModIcon.jsx";
import NotificationsIcon from "@mui/icons-material/Notifications";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import ShieldRoundedIcon from '@mui/icons-material/ShieldRounded';
import Signout from "../../../database/authentication/Signout";
import Username from "../../Username/Username";

function ProfileExplorer({ imageReducer }) {
  /* ===== VARIABLES ===== */
  const AVATAR_LENGTH = 48;

  /* ===== CONTEXTS ===== */

  // user state & is moderator function from user context
  const { user, isModerator } = useContext(UserContext);

  /* ===== FUNCTIONS ===== */

  // database functions
  const { signOut } = Signout();

  /* ===== PROFILE EXPLORER COMPONENT ===== */
  return ( 
    <div className={ styles.profile }>

      { /* Avatar - simply render the current user's avatar, which should link to the page to view their profile */ }
      <div className={ styles.avatarLinkWrapper }>
        <Link to={ `/user/${ user.profile.id }` } title="View Profile">
          <div className={ styles.avatarWrapper }>
            <Avatar profileId={ user.profile.id } size={ AVATAR_LENGTH } imageReducer={ imageReducer } />
          </div>
        </Link>
      </div>

      <div className={ styles.details }>

        { /* Username: render the user's username */ }
        <div className={ styles.usernameWrapper }>
          <Username profile={ user.profile } />
        </div>

        { /* Links: all the user's different links */ }
        <div className={ styles.profileLinks }>

          { /* Profile settings link - profile icon that links to the profile page */ }
          <div className={ styles.profileLink }>
            <Link to="/profile" className="center">
              <ManageAccountsIcon titleAccess="Profile Settings" />
            </Link>
          </div>

          { /* Notifications link - bell icon that links to the notifications page */ }
          <div className={ styles.profileLink }>
            { user.notificationCount > 0 ?
              <Link to="/notifications" className="center">
                <span>{ user.notificationCount }</span>
                <NotificationsIcon titleAccess="Notifications" />
              </Link>
            :
              <Link to="/notifications" className="center">
                <NotificationsNoneOutlinedIcon titleAccess="Notifications" />
              </Link>
            }
          </div>

          { /* Administrator hub link - icon that links to the administrator hub page (for admins only) */ }
          { user.profile.administrator &&
            <div className={ styles.profileLink }>
              <Link to="/administrator" className="center">
                <ShieldRoundedIcon titleAccess="Administrator Hub" />
              </Link>
            </div>
          }

          { /* Moderator hub link - icon that links to the moderation hub page (for admins + moderators only) */ }
          { isModerator() &&
            <div className={ styles.profileLink }>
              <Link to="/moderator" className="center">
                <ModIcon />
              </Link>
            </div>
          }

          { /* Logout button - button that allows the user to log out of their account */ }
          <div className={ styles.profileLink }>
            <button type="button" className={ styles.btn } onClick={ signOut }>
              <LogoutIcon titleAccess="Sign Out" fontSize="small" />
            </button>
          </div>

        </div>
        
      </div>
    </div>
  );
};

/* ===== EXPORTS ===== */
export default ProfileExplorer;