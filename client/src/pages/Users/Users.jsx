/* ===== IMPORTS ===== */
import styles from "./Users.module.css";
import UsersLogic from "./Users.js";
import UserSearch from "../../components/UserSearch/UserSearch.jsx";

function Users({ imageReducer }) {
  /* ===== FUNCTIONS ===== */
  const { navigateToUser } = UsersLogic();

  /* ===== VARIABLES ===== */
  const USERS_PER_PAGE = 20;
  const options = {
    isDetailed: true,
    disableLink: false,
    onUserRowClick: navigateToUser
  };

  /* ===== USERS COMPONENT ===== */
  return (
    <div className={ styles.users }>
      <h1>Users</h1>
      <p>Below is a list of all SMB Elite users. This page provides an easy way to access any user profile.</p>
      <div className={ styles.body }> 
        <UserSearch
          usersPerPage={ USERS_PER_PAGE }
          imageReducer={ imageReducer }
          userRowOptions={ options }
        />
      </div>
    </div>
  );
};

/* ===== EXPORTS ===== */
export default Users;