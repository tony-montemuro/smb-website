/* ===== IMPORTS ===== */
import "./Users.css";
import { useContext, useEffect } from "react";
import { StaticCacheContext } from "../../utils/Contexts";
import PageControls from "../../components/PageControls/PageControls.jsx";
import SearchBarInput from "../../components/SearchBarInput/SearchBarInput.jsx";
import UserRow from "./UserRow";
import UsersLogic from "./Users.js";

function Users({ imageReducer }) {
  /* ===== CONTEXTS ===== */
  const { staticCache } = useContext(StaticCacheContext);

  /* ===== STATES & FUNCTIONS ===== */
 
  // states & functions from the js file
  const { 
    USERS_PER_PAGE, 
    searchRef, 
    users, 
    pageNum,
    forceUpdate,
    setPageNum, 
    getStartAndEnd, 
    updateResults, 
    resetPageNum, 
    clearSearch 
  } = UsersLogic();

  /* ===== EFFECTS ===== */

  // code that is executed when the component mounts, when pageNum updates, when forceUpdate updates, OR
  // when the profiles cache is loaded
  useEffect(() => {
    if (staticCache.profiles) {
      updateResults(searchRef.current ? searchRef.current.value : "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageNum, forceUpdate, staticCache.profiles]);

  /* ===== USERS COMPONENT ===== */
  return users.data &&
    <div className="users">

      { /* Users header - render the name of the page, it's description, and a searchbar */ }
      <div className="users-header">

        { /* Page name and description */ }
        <h1>Users</h1>
        <p>Below is a list of all SMB Elite users. This page provides an easy way to access any user profile.</p>

        { /* Search bar input for searching for users */ }
        <SearchBarInput itemType={ "user" } searchRef={ searchRef } handleFilter={ resetPageNum } clearSearch={ clearSearch } />

      </div>

      { /* Render the list of users, as well as pagination controls */ }
      <div className="users-body">

        { /* Render the filtered list of users */ }
        { users.data.length > 0 ?
          users.data.map(user => {
            return <UserRow imageReducer={ imageReducer } user={ user } key={ user.id } />
          })
        :
          <div className="users-empty">No users match your search.</div>
        }

        { /* Render pagination controls */ }
        <div className="users-body-page-controls-wrapper">
          <PageControls
            totalItems={ users.total }
            itemsPerPage={ USERS_PER_PAGE }
            pageNum={ pageNum }
            setPageNum={ setPageNum }
            itemName={ "Users" } 
            getStartAndEnd={ getStartAndEnd }
          />
        </div>

      </div>

    </div>
};

/* ===== EXPORTS ===== */
export default Users;