/* ===== IMPORTS ===== */
import "./Users.css";
import { useContext, useEffect } from "react";
import { StaticCacheContext } from "../../utils/Contexts";
import UserRow from "./UserRow";
import UsersLogic from "./Users.js";

function Users({ imageReducer }) {
  /* ===== CONTEXTS ===== */
  const { staticCache } = useContext(StaticCacheContext);

  /* ===== STATES & FUNCTIONS ===== */

  // states & functions from the js file
  const { searchRef, users, prepareUsers, handleFilter, clearSearch } = UsersLogic();

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

        { /* Page name and description */ }
        <h1>Users</h1>
        <p>Below is a list of all SMB Elite users. This page provides an easy way to access any user profile.</p>

        <div className="users-searchbar-container">

          { /* User searchbar input: a text input field that allows the user to search for the desired user */ }
          <input
            type="text" 
            ref={ searchRef }
            placeholder="Search for user..."
            onChange={ (e) => handleFilter(e.target.value) }
          />

          { /* User searchbar icon: an icon, which is initially just for decoration, turns into a clickable icon when user
          enters any text. */ }
          <div className="users-searchbar-icon">
            { searchRef.current && searchRef.current.value.length > 0 ?
              <button type="button" className="users-searchbar-clear" onClick={ clearSearch }>❌</button> 
            : 
              <>🔍</> 
            }
          </div>

        </div>
      </div>

      { /* Render the list of users */ }
      <div className="users-body">
        { users.filtered.map(user => {
          return <UserRow imageReducer={ imageReducer } user={ user } id={ user.id } />
        })}
      </div>

    </div>
};

/* ===== EXPORTS ===== */
export default Users;