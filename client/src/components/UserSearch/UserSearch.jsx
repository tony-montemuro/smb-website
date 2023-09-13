/* ===== IMPORTS ===== */
import "./UserSearch.css";
import { useEffect } from "react";
import PageControls from "../PageControls/PageControls.jsx";
import SearchBarInput from "../SearchBarInput/SearchBarInput";
import UserSearchLogic from "./UserSearch.js";
import UserRow from "../UserRow/UserRow.jsx";

function UserSearch({ usersPerPage, searchBarWidth = "100%", imageReducer = null, userRowOptions }) {
  /* ===== STATES & FUNCTIONS ===== */
  const { users, pageNum, searchInput, setPageNum, setSearchInput, getStartAndEnd, updateResults } = UserSearchLogic(usersPerPage);

  /* ===== EFFECTS ===== */

  // code that is executed when the component mounts OR when user makes changes pages AND/OR makes a change to the search bar
  useEffect(() => {
    updateResults(searchInput);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageNum]);

  // code that is executed when the component mounts OR when users makes a change to searchbar input
  useEffect(() => {
    if (pageNum === 1) {
      updateResults(searchInput);
    } else {
      setPageNum(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  /* ===== USER SEARCH BAR COMPONENT ===== */
  return users.data &&
    <div className="user-search">

      { /* Search bar input for searching for users */ }
      <SearchBarInput itemType={ "user" } input={ searchInput } setInput={ setSearchInput } width={ searchBarWidth } />

      <div className="users-search-results">

        {/* Render a UserRow component for each user that exists in the `data` array */}
        { users.data.length > 0 ?
          users.data.map(user => {
            return (
              <UserRow 
                user={ user }
                imageReducer={ imageReducer } 
                disableLink={ userRowOptions.disableLink }
                isDetailed={ userRowOptions.isDetailed } 
                onClick={ userRowOptions.onUserRowClick }
                key={ user.id } 
              />
            );
          })
        :
          // If no user data, just render a message to the user letting them know 
          <div className="user-search-empty">No users match your search.</div>
        }

        { /* Render pagination controls */ }
        <div className="users-search-bar-page-controls-wrapper">
          <PageControls
            totalItems={ users.total }
            itemsPerPage={ usersPerPage }
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
export default UserSearch;