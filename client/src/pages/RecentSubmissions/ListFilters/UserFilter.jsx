/* ===== IMPORTS ===== */
import { useEffect } from "react";
import styles from "./ListFilters.module.css";
import Items from "../../../components/Items/Items.jsx";
import Loading from "../../../components/Loading/Loading.jsx";
import UserFilterLogic from "./UserFilter.js";
import UserSearch from "../../../components/UserSearch/UserSearch.jsx";
import UserRow from "../../../components/UserRow/UserRow.jsx";

function UserFilter({ searchParams, setSearchParams, globalUsers, updateGlobalUsers }) {
  /* ===== FUNCTIONS ===== */
  
  // functions from the js file
  const { syncUsers, users, addUser, removeUser, resetFilter, closePopupAndUpdate } = UserFilterLogic(updateGlobalUsers);

  /* ===== VARIABLES ===== */
  const USERS_PER_PAGE = 20;
  const userRowOptions = {
    disableLink: true,
    onUserRowClick: addUser
  };

  /* ===== EFFECTS ===== */

  // code that is executed on component mount
  useEffect(() => {
    syncUsers(globalUsers);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  /* ===== USER FILTER COMPONENT ===== */
  return (
    <div className={ styles.filter }>

      { /* Render name of the popup */ }
      <div className={ styles.section }>
        <h1>Filter by User</h1>
      </div>

      <hr />

      { users ?
        <>

          { /* Next, render the set of all users that the user wants / has already filtered by */ }
          <div className={ styles.section }>
            <h2>Filtered Users</h2>
            <p>Click a user to remove it as a filter.</p>
            { users ?
              <>
                <Items items={ users } emptyMessage="You are not currently filtering by any users.">
                  { users.map((user, index) => {
                    return (
                      <UserRow
                        user={ user }
                        onClick={ removeUser }
                        index={ index }
                        disableLink
                        key={ user.id }
                      />
                    );
                  })}
                </Items>
                <div className={ styles.btns }>
                  <button type="button" className="cancel" onClick={ resetFilter }>Reset Filter</button>
                  <button type="button" onClick={ () => closePopupAndUpdate(searchParams, setSearchParams) }>
                    Apply Filters
                  </button>
                </div>
              </>
            :
              <Loading />
            }
          </div>

          <hr />
          
          { /* Render a user search component to select a user to filter by */ }
          <div className={ styles.section }>
            <h2>Add Users</h2>
            <p>Click a user to add it as a filter.</p>
          </div>
          <UserSearch 
            usersPerPage={ USERS_PER_PAGE }
            userRowOptions={ userRowOptions }
          />

        </>
      :
        <Loading />
      }
    </div>
  );
};

/* ===== EXPORTS ===== */
export default UserFilter;