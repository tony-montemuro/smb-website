/* ===== IMPORTS ===== */
import styles from "./Navbar.module.css";
import { Link } from "react-router-dom";
import { useContext } from "react";
import { UserContext } from "../../utils/Contexts";
import Logo from "../../assets/svg/Logo.jsx";
import NavCreateProfile from "./NavCreateProfile";
import NavProfile from "./NavProfile";
import NavSignIn from "./NavSignIn";

function Navbar({ imageReducer }) {  
  /* ===== CONTEXTS ===== */

  // user state from user context
  const { user } = useContext(UserContext);

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
            <NavProfile imageReducer={ imageReducer } />
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