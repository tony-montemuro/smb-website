/* ===== IMPORTS ===== */
import { PopupContext } from "../../utils/Contexts.js";
import { useContext, useEffect } from "react";
import UserFilterLogic from "./UserFilter.js";
import UserSearch from "../../components/UserSearch/UserSearch.jsx";
import UserRow from "../../components/UserRow/UserRow.jsx";

function UserFilter({ searchParams, setSearchParams }) {
  /* ===== CONTEXTS ===== */

  // close popup function from popup context
  const { closePopup } = useContext(PopupContext);

  /* ===== FUNCTIONS ===== */
  const { users, fetchUsers, addUser, removeUser, resetFilter, closePopupAndUpdate } = UserFilterLogic();

  /* ===== VARIABLES ===== */
  const USERS_PER_PAGE = 20;
  const userRowOptions = {
    disableLink: true,
    onUserRowClick: addUser
  };

  /* ===== EFFECTS ===== */

  // code that is executed when the component mounts
  useEffect(() => {
    fetchUsers(searchParams);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  /* ===== USER FILTER COMPONENT ===== */
  return (
    <div className="recent-submissions-user-filter">

      { /* Render name of component */ }
      <h1>Filter by User</h1>

      <div className="recent-submissions-filter-selected">
        <h2>Filtered Users</h2>
        <p>Click a user to remove it as a filter.</p>

        { /* Only render the list of users if the `users` state is defined */ }
        { users ?
          <>
            { users.length > 0 ?

              // Render a user row for each user
              <div className="recent-submissions-popup-selected-items">
                { users.map(user => {
                  return (
                    <UserRow
                      user={ user }
                      disableLink={ true }
                      onClick={ removeUser }
                    />
                  );
                })}

              </div>
            :
              // Otherwise, let the user know that they have not selected any users to filter by
              <i id="recent-submissions-filter-empty">You are not currently filtering by any users.</i>
            }

            { /* Render a button that allows user to reset filters, as well as apply any filters */ }
            <div className="recent-submissions-filter-submit-btns">
              <button type="button" onClick={ resetFilter }>Reset Filter</button>
              <button type="button" onClick={ () => closePopupAndUpdate(closePopup, searchParams, setSearchParams) }>
                Apply Filters
              </button>
            </div>
          </>

        :
          // Otherwise, render a loading component
          <p>Loading...</p>
        }

      </div>

      { /* Finally, render a user search component to select a user to filter by */ }
      <div className="game-search-add">
        <h2>Add Users</h2>
        <p>Click a user to add it as a filter.</p>
        <UserSearch 
          usersPerPage={ USERS_PER_PAGE }
          searchBarWidth={ "100%" }
          userRowOptions={ userRowOptions }
        />
      </div>

    </div>
  );
};

/* ===== EXPORTS ===== */
export default UserFilter;