import React from "react";
import { Link } from "react-router-dom";
import { supabase } from "../SupabaseClient/SupabaseClient";
import './navbar.css';

function Navbar({ isMod }) {
  return (
    <nav className="nav">
      <Link to="/" className="site-title">Home</Link>
      <ul>
        {isMod ?
          <li>
            <Link to="/submissions">Recent Submissions</Link>
          </li>
        :
          ""
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
        {supabase.auth.user() ? 
          <li>
            <Link to="/profile">Edit Profile</Link>
          </li>
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