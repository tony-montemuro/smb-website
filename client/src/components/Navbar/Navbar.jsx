/* ===== IMPORTS ===== */
import "./Navbar.css";
import { Link } from "react-router-dom";
import { useContext } from "react";
import { UserContext } from "../../Contexts";
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
        <Link to="/" className="site-title">Home</Link>

        <ul>
          { /* LINKS FOR MODERATORS */ }
          { user.id && user.is_mod &&

            // For moderators, render a link to the Recent Submissions page
            <li>
              <Link to="/submissions">Recent Submissions</Link>
            </li>

          }

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

          { /* LINKS FOR AUTHENTICATED USERS */ }
          { user.id ? 
            <>

              { /* Link to the notifications page */ }
              <li>
                  <Link to="/notifications">
                    { user.notifications.length > 0 ? user.notifications.length : null } Notifications
                  </Link>
              </li>

              { /* Link to the email update page */ }
              <li>
                <Link to="/email-update">Update Email</Link>
              </li>

              { /* Link to the profile page */ }
              <li>
                <Link to="/profile">Edit Profile</Link>
              </li>

              <li>
                <NavProfile imageReducer={ imageReducer } />
              </li>

            </>
          : 
            // If not an authenticated user, render a link to the login page
            <li>
              <Link to="/login">Login / Sign Up</Link>
            </li>
            
          }
        </ul>
      </nav>
    </div>
  );
};

/* ===== EXPORTS ===== */
export default Navbar;