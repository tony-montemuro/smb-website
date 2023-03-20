/* ===== IMPORTS ===== */
import "./User.css";
import "/node_modules/flag-icons/css/flag-icons.min.css";
import { useNavigate } from "react-router-dom";
import { StaticCacheContext } from "../../Contexts";
import { useContext, useEffect, useState } from "react";
import UserInfo from "./UserInfo";
import UserStatsDirectory from "./UserStatsDirectory";

function User({ imageReducer }) {
  /* ===== VARIABLES ===== */
  const navigate = useNavigate();
  const userId = window.location.pathname.split("/")[2];

  /* ===== CONTEXTS ===== */

  // static cache state from static cache context
  const { staticCache } = useContext(StaticCacheContext);

  /* ===== STATES AND FUNCTIONS ===== */
  const [user, setUser] = useState(undefined);

  /* ===== EFFECTS ===== */

  // code that is executed when the page loads, or when the staticCache object is updated
  useEffect(() => {
    if (staticCache.profiles.length > 0) {
      // see if userId corresponds to a profile stored in cache
      const profiles = staticCache.profiles;
      const user = profiles.find(row => row.id === userId);

      // if not, we will print an error message, and navigate to the home screen
      if (!user) {
        console.log("Error: Invalid user.");
        navigate("/");
        return;
      }

      // update the user state hook
      setUser(user);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [staticCache]);

  /* ===== USER COMPONENT ===== */
  return (
    // If the user data has been loaded, we can render the user's information to the client. Otherwise, 
    // render a loading component.
    <div className="user">
      { user ?
        <>

          { /* Render both user info, and a directory to the user stats pages */ }
          <UserInfo user={ user } imageReducer={ imageReducer } />
          <UserStatsDirectory />
          
        </>
      :
        // Loading Component
        <p>Loading...</p>
      }
    </div>
  );
};

/* ===== EXPORTS ===== */
export default User;