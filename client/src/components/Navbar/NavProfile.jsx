/* ===== IMPORTS ===== */
import { useContext } from "react";
import { UserContext } from "../../utils/Contexts";
import CreateProfile from "./Profile/CreateProfile.jsx";
import MobileProfile from "./Mobile/MobileProfile.jsx";
import ProfileExplorer from "./Profile/ProfileExplorer.jsx";
import SignIn from "./Profile/SignIn.jsx";

function NavProfile({ windowWidth, dropdownCutoff, isOpen, setIsOpen, imageReducer }) {
  /* ===== CONTEXTS ===== */
  const { user } = useContext(UserContext);

  /* ===== NAV PROFILE COMPONENT ===== */
  if (user.id && user.profile) {
    return windowWidth > dropdownCutoff ? 
      <ProfileExplorer imageReducer={ imageReducer } />
    :
      <MobileProfile isOpen={ isOpen } setIsOpen={ setIsOpen } imageReducer={ imageReducer } />;
  }
  if (user.id) {
    return <CreateProfile />;
  }
  return <SignIn />;
};

/* ===== EXPORTS ===== */
export default NavProfile;