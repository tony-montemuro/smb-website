/* ===== IMPORTS ===== */
import "./Users.css";
import UsersLogic from "./Users.js";
import UserSearch from "../../components/UserSearch/UserSearch.jsx";

function Users({ imageReducer }) {
  /* ===== FUNCTIONS ===== */
  const { navigateToUser } = UsersLogic();

  /* ===== VARIABLES ===== */
  const USERS_PER_PAGE = 10;
  const options = {
    isDetailed: true,
    disableLink: false,
    onUserRowClick: navigateToUser
  };

  /* ===== USERS COMPONENT ===== */
  return (
    <div className="users">

      { /* Users header - render the name of the page, it's description, and a searchbar */ }
      <div className="users-header">

        { /* Page name and description */ }
        <h1>Users</h1>
        <p>Below is a list of all SMB Elite users. This page provides an easy way to access any user profile.</p>

      </div>

      { /* Now, render the user search component */ }
      <UserSearch
        usersPerPage={ USERS_PER_PAGE }
        searchBarWidth={ "40%" }
        imageReducer={ imageReducer }
        userRowOptions={ options }
      />

    </div>
  );
};

/* ===== EXPORTS ===== */
export default Users;