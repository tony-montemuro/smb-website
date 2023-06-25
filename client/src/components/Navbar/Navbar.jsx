/* ===== IMPORTS ===== */
import "./Navbar.css";
import { Link } from "react-router-dom";
import { useContext } from "react";
import { UserContext } from "../../Contexts";
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
        <Link to="/" className="nav-title" title="Home">
          <img id="nav-logo" src={ Logo } alt="SMBElite"></img>
        </Link>

        <ul>

          { /* Link to the games page */ }
          <li>
            <Link to="/games">Games</Link>
          </li>

          { /* Link to the resources page */ }
          <li>
            <Link to="/resources">Resources</Link>
          </li>

          { /* Link to the support page */ }
          <li>
            <Link to="/support">Support</Link>
          </li>

        </ul>

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