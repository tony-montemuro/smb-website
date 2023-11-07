/* ===== IMPORTS ===== */
import styles from "./Navbar.module.css";
import { useEffect, useState } from "react";
import NavLogo from "./NavLogo.jsx";
import NavProfile from "./NavProfile.jsx";

function Navbar({ imageReducer }) {  
  /* ===== VARIABLES ===== */
  const dropdownCutoff = 940; // measured in pixels

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
      document.body.style.overflow = "visible";
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

        { /* Render the dynamic `NavLogo` component on the left-side of the navbar */ }
        <NavLogo 
          windowWidth={ windowWidth }
          dropdownCutoff={ dropdownCutoff }
          isOpen={ isLogoOpen }
          setIsOpen={ setIsLogoOpen }
        />

        { /* Render the dynamic `NavProfile` component on the right-side of the navbar */ }
        <NavProfile
          windowWidth={ windowWidth }
          dropdownCutoff={ dropdownCutoff }
          isOpen={ isProfileOpen }
          setIsOpen={ setIsProfileOpen }
          imageReducer={ imageReducer }  
        />

      </nav>
    </div>
  );
};

/* ===== EXPORTS ===== */
export default Navbar;