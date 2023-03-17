/* ===== IMPORTS ===== */
import './navbar.css';
import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { UserContext } from "../../Contexts";

function Navbar() {  
  /* ===== CONTEXTS ===== */

  // user state from user context
  const { user } = useContext(UserContext);

  /* ===== NAVBAR COMPONENT ===== */
  return (
    <nav className="nav">
      <Link to="/" className="site-title">Home</Link>
      <ul>
        { user.id && user.is_mod ?
          <li>
            <Link to="/submissions">Recent Submissions</Link>
          </li>
        :
          null
        }
        <li>
          <Link to="/games">Games</Link>
        </li>
        <li>
          <Link to="/resources">Resources</Link>
        </li>
        <li>
          <Link to="/support">Support</Link>
        </li>
        { user.id ? 
          <>
            <li>
                <Link to="/notifications">
                  { user.notifications.length > 0 ? user.notifications.length : null } Notifications
                </Link>
            </li>
            <li>
              <Link to="/profile">Edit Profile</Link>
            </li>
          </>
        : 
          <li>
            <Link to="/login">Login</Link>
          </li>
        }
      </ul>
    </nav>
  );
};

export default Navbar;