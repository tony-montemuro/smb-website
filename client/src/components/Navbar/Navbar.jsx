/* ===== IMPORTS ===== */
import "./Navbar.css";
import { Link } from "react-router-dom";
import { useContext } from "react";
import { UserContext } from "../../Contexts";
import Logo from "../../img/logo.png";
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

        { /* Render an authenticated user's profile information, if they are logged in. Otherwise, render the login / signup button. */ }
        { user.id ? 
          <NavProfile imageReducer={ imageReducer } />
        :
          <Link id="nav-login" to="/login">Login / Sign Up</Link>
        }

      </nav>
    </div>
  );
};

/* ===== EXPORTS ===== */
export default Navbar;