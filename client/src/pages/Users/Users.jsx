/* ===== IMPORTS ===== */
import "./Users.css";
import { useContext, useEffect } from "react";
import { StaticCacheContext } from "../../utils/Contexts";
import DetailedUsername from "../../components/DetailedUsername/DetailedUsername.jsx";
import UsersLogic from "./Users.js";

function Users({ imageReducer }) {
  /* ===== CONTEXTS ===== */
  const { staticCache } = useContext(StaticCacheContext);

  /* ===== STATES & FUNCTIONS ===== */

  // states & functions from the js file
  const { users, prepareUsers } = UsersLogic();

  /* ===== EFFECTS ===== */

  // code that is executed when the page loads, or when the profiles cache is loaded
  useEffect(() => {
    if (staticCache.profiles) {
      prepareUsers(staticCache.profiles);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [staticCache.profiles]);

  /* ===== USERS COMPONENT ===== */
  return users &&
    <div className="users">

      { /* Users header - render the name of the page, it's description, and a searchbar */ }
      <div className="users-header">
        <h1>Users</h1>
        <p>Below is a list of all SMB Elite users. This page provides an easy way to access any profile.</p>
      </div>

      { /* Render the list of users */ }
      <div className="users-body">
        { users.map(user => {
          return <DetailedUsername imageReducer={ imageReducer } country={ user.country.iso2 } profileId={ user.id } username={ user.username } />
        })}
      </div>

    </div>
};

/* ===== EXPORTS ===== */
export default Users;