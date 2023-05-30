/* ===== IMPORTS ===== */
import { useContext } from "react";
import { UserContext } from "../../Contexts";
import Avatar from "../Avatar/Avatar.jsx";

function NavProfile({ imageReducer }) {
  /* ===== CONTEXTS ===== */

  // user state from user context
  const { user } = useContext(UserContext);

  /* ===== NAV PROFILE COMPONENT ===== */
  return ( 
    <div className="nav-profile">
      <Avatar profileId={ user.profile.id } size={ 60 } imageReducer={ imageReducer } />
      <span>{ user.profile.username }</span>
    </div>
  );
};

/* ===== EXPORTS ===== */
export default NavProfile;