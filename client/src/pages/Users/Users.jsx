/* ===== IMPORTS ===== */
import "./Users.css";
import { useEffect } from "react";
import PageControls from "../../components/PageControls/PageControls.jsx";
import SearchBarInput from "../../components/SearchBarInput/SearchBarInput.jsx";
import UserRow from "./UserRow";
import UsersLogic from "./Users.js";

function Users({ imageReducer }) {
  /* ===== STATES & FUNCTIONS ===== */
 
  // states & functions from the js file
  const { 
    USERS_PER_PAGE, 
    users, 
    pageNum, 
    searchInput,
    setPageNum, 
    setSearchInput,
    getStartAndEnd, 
    updateResults
  } = UsersLogic();

  /* ===== EFFECTS ===== */

  // code that is executed when the component mounts OR when pageNum updates OR when searchInput updates
  useEffect(() => {
    updateResults(searchInput);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageNum]);

  // code that is executed each time the user updates the searchInput
  useEffect(() => {
    if (pageNum === 1) {
      updateResults(searchInput);
    } else {
      setPageNum(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  /* ===== USERS COMPONENT ===== */
  return users.data &&
    <div className="users">

      { /* Users header - render the name of the page, it's description, and a searchbar */ }
      <div className="users-header">

        { /* Page name and description */ }
        <h1>Users</h1>
        <p>Below is a list of all SMB Elite users. This page provides an easy way to access any user profile.</p>

        { /* Search bar input for searching for users */ }
        <SearchBarInput itemType={ "user" } input={ searchInput } setInput={ setSearchInput } />

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