/* ===== IMPORTS ===== */
import styles from "./Navbar.module.css";
import { Link } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "../../utils/Contexts";
import Logo from "../../assets/svg/Logo.jsx";
import MobileLogo from "./Mobile/MobileLogo.jsx";
import NavCreateProfile from "./NavCreateProfile";
import NavProfile from "./NavProfile";
import NavSignIn from "./NavSignIn";
import MobileProfile from "./Mobile/MobileProfile";

function Navbar({ imageReducer }) {  
  /* ===== VARIABLES ===== */
  const dropdownCutoff = 940;

  /* ===== CONTEXTS ===== */

  // user state from user context
  const { user } = useContext(UserContext);

  /* ===== STATES ===== */
  const [isLogoOpen, setIsLogoOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  /* ===== EFFECTS ===== */

  // code that executes when the component mounts
  useEffect(() => {
    // function to update the `windowWidth` state
    const updateWindowWidth = () => setWindowWidth(window.innerWidth);

    // add event listener for window resize
    window.addEventListener("resize", updateWindowWidth);

    // clean up function for when component unmounts
    return () => window.removeEventListener("resize", updateWindowWidth);
  }, []);

  // code that is executed each time the `isLogoOpen` OR `isProfileOpen` state are changed
  useEffect(() => {
    if (isLogoOpen || isProfileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "visible";
    }
    
    // Cleanup function
    return () => {
      document.body.style.overflow = "hidden";
    };
  }, [isLogoOpen, isProfileOpen]);

  // code that is executed each time the window width updates
  useEffect(() => {
    // if windowWidth exceeds the dropdownCutoff limit, `isLogoOpen` and `isProfileOpen` should be false
    if (windowWidth > dropdownCutoff) {
      setIsLogoOpen(false);
      setIsProfileOpen(false);
    }
  }, [windowWidth]);

  /* ===== NAVBAR COMPONENT ===== */
  return (
    <div className={ styles.navWrapper }>
      <nav className={ styles.nav }>

        { /* Link to the homepage - left side of navbar */ }
        <div className={ styles.logo }>
          <Link to="/" title="Home">
            <Logo />
          </Link>
        </div>
        
        { /* Mobile logo, which should render in place of the standard logo once the screen goes below `dropdownCutoff`px */ }
        <MobileLogo isOpen={ isLogoOpen } setIsOpen={ setIsLogoOpen } />

        { /* List - various links, including games, users, news, resources, support page. */ }
        <div className={ styles.list }>
          <Link to="/games" title="Games">Games</Link>
          <Link to="/users" title="Users">Users</Link>
          <Link to="/news" title="News">News</Link>
          <Link to="/resources" title="Resources">Resources</Link>
          <Link to="/support" title="Support">Support</Link>
        </div>

        {/* 3 cases:
          1.) User is authenticated and has a profile: render the NavProfile component.
          2.) User is authenticated, but has not created a profile: Render a simple button that navigates to the profile page. 
          3.) User is not authenticatged: Render the Login component. 
        */}
        { user.id ? 
          user.profile ?
            <>
              <NavProfile imageReducer={ imageReducer } />
              <MobileProfile isOpen={ isProfileOpen } setIsOpen={ setIsProfileOpen } imageReducer={ imageReducer } />
            </>
          :
            <NavCreateProfile />
        :
          <NavSignIn />
        }

      </nav>
    </div>
  );
};

/* ===== EXPORTS ===== */
export default Navbar;