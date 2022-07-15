import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import './navbar.css';
import { supabase } from "../SupabaseClient/SupabaseClient";

function Navbar({ session }) {

  // state the determines whether or not current user is a moderator
  const [isMod, setIsMod] = useState(false);

  // function that queries the mod table to see if current user is a mod
  const queryMods = async () => {
    try {
      // initialize variables
      const userId = supabase.auth.user().id;

      const { data: mods, error, status } = await supabase
        .from("moderators")
        .select("user_id")

      if (error && status !== 406) {
        throw error;
      }

      // now, iterate through each mod. if a match is detected, update state
      for (const mod of mods) {
        if (mod.user_id === userId) {
          setIsMod(true);
        }
      }

    } catch (error) {
      alert(error.message);
    }
  }

  useEffect(() => {
    queryMods();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        {session ? 
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