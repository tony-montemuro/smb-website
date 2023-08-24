/* ===== IMPORTS ===== */
import "./Users.css";
import { useContext, useEffect } from "react";
import { StaticCacheContext } from "../../utils/Contexts";
import CachedPageControls from "../../components/CachedPageControls/CachedPageControls.jsx";
import SearchBarInput from "../../components/SearchBarInput/SearchBarInput.jsx";
import UserRow from "./UserRow";
import UsersLogic from "./Users.js";

function Users({ imageReducer }) {
  /* ===== VARIABLES ===== */
  const USERS_PER_PAGE = 10;

  /* ===== CONTEXTS ===== */
  const { staticCache } = useContext(StaticCacheContext);

  /* ===== STATES & FUNCTIONS ===== */
 
  // states & functions from the js file
  const { searchRef, users, pageNum, setPageNum, prepareUsers, handleFilter, clearSearch } = UsersLogic();

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

        { /* Search bar input for searching for users */ }
        <SearchBarInput itemType={ "user" } searchRef={ searchRef } handleFilter={ handleFilter } clearSearch={ clearSearch } />

      </div>

      { /* Render the list of users, as well as pagination controls */ }
      <div className="users-body">

        { /* Render the filtered list of users */ }
        { users.filtered.length > 0 ?
          users.filtered.slice((pageNum-1)*USERS_PER_PAGE, pageNum*USERS_PER_PAGE).map(user => {
            return <UserRow imageReducer={ imageReducer } user={ user } key={ user.id } />
          })
        :
          <div className="users-empty">No users match your search.</div>
        }

        { /* Render pagination controls */ }
        <div className="users-body-page-controls-wrapper">
          <CachedPageControls 
            items={ users.filtered }
            itemsPerPage={ USERS_PER_PAGE }
            pageNum={ pageNum }
            setPageNum={ setPageNum }
            itemsName={ "Users" }
          />
        </div>

      </div>

    </div>
};

/* ===== EXPORTS ===== */
export default Users;