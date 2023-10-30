/* ===== IMPORTS ===== */
import { Link } from "react-router-dom";
import { useContext } from "react";
import { UserContext } from "../../../utils/Contexts";
import styles from "./Mobile.module.css";
import Avatar from "../../Avatar/Avatar.jsx";
import CloseButton from "../../CloseButton/CloseButton.jsx";
import Signout from "../../../database/authentication/Signout";
import Username from "../../Username/Username.jsx";

function MobileProfile({ isOpen, setIsOpen, imageReducer }) {
  /* ===== VARIABLES ===== */
  const AVATAR_LENGTH = 60;

  /* ===== CONTEXTS ===== */

  // user state & is moderator function from user context
  const { user, isModerator } = useContext(UserContext);

  /* ===== FUNCTIONS ===== */

  // database functions
  const { signOut } = Signout();
  
  // FUNCTION 1: onSignOut - code that executes when the user wants to sign out of their account
  // PRECONDITIONS: NONE
  // POSTCONDITIONS (1 possible outcome):
  // the user is signed out, and the dropdown is closed
  const onSignOut = () => {
    signOut();
    setIsOpen(false);
  };

  /* ===== MOBILE PROFILE COMPONENT ===== */
  return (
    <>

      {/* Simplified profile logo, which will activate dropdown when pressed */}
      <div className={ styles.mobileLogo } onClick={ () => setIsOpen(true) }>
        <div className="center">
          <Avatar profileId={ user.profile.id } size={ AVATAR_LENGTH } imageReducer={ imageReducer } />
        </div>
      </div>

      { /* Dropdown element, which should only render if `isOpen` is set to true */ }
      <div className={ `${ styles.dropdown }${ isOpen ? ` ${ styles.open }` : "" }` }>
        <div className={ `${ styles.dropdownInner } ${ styles.innerRight }` }>
          <div className={ styles.dropdownClose }>
            <CloseButton onClose={ () => setIsOpen(false) } />
          </div>
          <div className={ styles.dropdownLinks }>

            { /* First, render a link to the user's page */ }
            <Link to={ `/user/${ user.profile.id }` } onClick={ () => setIsOpen(false) } title="View Profile">
              <Username profile={ user.profile } />
            </Link>

            <hr />

            { /* Next, render links to user-specific pages: editing profile, notifications, hubs for elevated users, etc. */ }
            <Link to="/profile" onClick={ () => setIsOpen(false) }>Profile Settings</Link>
            <Link to="/notifications" onClick={ () => setIsOpen(false) }>
              Notifications{ user.notificationCount > 0 && ` (${ user.notificationCount })` }
            </Link>
            { user.profile.administrator && <Link to="/administrator" onClick={ () => setIsOpen(false) }>Administrator Hub</Link> }
            { isModerator() && <Link to="/moderator" onClick={ () => setIsOpen(false) }>Moderator Hub</Link> }

            <hr />

            { /* Finally, render option to sign out */ }
            <span id={ styles.signout } onClick={ onSignOut }>Sign Out</span>

          </div>
        </div>
      </div>

    </>
  );
};

/* ===== EXPORTS ===== */
export default MobileProfile;