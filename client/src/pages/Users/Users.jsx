/* ===== IMPORTS ===== */
import "./Users.css";
import { useContext, useEffect } from "react";
import { StaticCacheContext } from "../../utils/Contexts";
import UserRow from "./UserRow";
import UsersLogic from "./Users.js";

function Users({ imageReducer }) {
  /* ===== VARIABLES ===== */
  const USERS_PER_PAGE = 3;

  /* ===== CONTEXTS ===== */
  const { staticCache } = useContext(StaticCacheContext);

  /* ===== STATES & FUNCTIONS ===== */
 
  // states & functions from the js file
  const { searchRef, users, pageNum, setPageNum, prepareUsers, handleFilter, clearSearch, getStartAndEnd, getMaxPage } = UsersLogic();

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
        { users.filtered.slice((pageNum-1)*USERS_PER_PAGE, pageNum*USERS_PER_PAGE).map(user => {
          return <UserRow imageReducer={ imageReducer } user={ user } key={ user.id } />
        })}

        { /* Users body bottom - render the page viewer, as well as page controls, within this container */ }
        <div className="users-body-bottom">

          { /* Users body page viewer - render the set of pages shown on the current page */ }
          <div className="users-body-page-viewer">
            Showing { getStartAndEnd(USERS_PER_PAGE).start } to&nbsp;
            { getStartAndEnd(USERS_PER_PAGE).end } of { users.filtered.length } Users
          </div>

          { /* Users body page control - render buttons to navigate to the previous and next page, as well as a dropdown for the
          user to select any valid page */ }
          <div className="users-body-page-control">
            <button onClick={ () => setPageNum(pageNum-1) } disabled={ pageNum <= 1 }>Previous Page</button>
            <select value={ pageNum } onChange={ (e) => setPageNum(parseInt(e.target.value)) }>
              { [...Array(getMaxPage(USERS_PER_PAGE)).keys()].map(num => {
                return <option value={ num+1 } key={ num+1 }>{ num+1 }</option>;
              })}
            </select>
            <button onClick={ () => setPageNum(pageNum+1) } disabled={ pageNum >= getMaxPage(USERS_PER_PAGE) }>Next Page</button>
          </div>

        </div>

      </div>

    </div>
};

/* ===== EXPORTS ===== */
export default Users;