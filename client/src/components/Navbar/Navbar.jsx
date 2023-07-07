/* ===== IMPORTS ===== */
import "./Navbar.css";
import { Link } from "react-router-dom";
import { useContext } from "react";
import { UserContext } from "../../utils/Contexts";
import Login from "../Login/Login.jsx";
import Logo from "../../img/logo.png";
import NavCreateProfile from "./NavCreateProfile";
import NavProfile from "./NavProfile";

function Navbar({ imageReducer }) {  
  /* ===== CONTEXTS ===== */

  // user state from user context
  const { user } = useContext(UserContext);

  /* ===== NAVBAR COMPONENT ===== */
  return (
    <div className="nav-wrapper">
      <nav className="nav">

        { /* Link to the homepage - left side of navbar */ }
        <Link to="/" title="Home">
          <img id="nav-logo" src={ Logo } alt="SMBElite"></img>
        </Link>

        { /* Nav list - various links, including games, resources, and support page. */ }
        <div className="nav-list">
          <ul>

            { /* Link to the games page */ }
            <li>
              <Link to="/games" title="Games">Games</Link>
            </li>

            { /* Link to the resources page */ }
            <li>
              <Link to="/resources" title="Resources">Resources</Link>
            </li>

            { /* Link to the support page */ }
            <li>
              <Link to="/support" title="Support">Support</Link>
            </li>

          </ul>
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
          <Login />
        }

      </nav>
    </div>
  );
};

/* ===== EXPORTS ===== */
export default Navbar;