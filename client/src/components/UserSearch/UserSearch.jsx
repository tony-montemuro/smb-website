/* ===== IMPORTS ===== */
import "./UserSearch.css";
import { useEffect, useState } from "react";
import Items from "../Items/Items.jsx";
import Loading from "../Loading/Loading.jsx";
import PageControls from "../PageControls/PageControls.jsx";
import SearchBarInput from "../SearchBarInput/SearchBarInput";
import UserSearchLogic from "./UserSearch.js";
import UserRow from "../UserRow/UserRow.jsx";

function UserSearch({ usersPerPage, searchBarWidth = "100%", imageReducer = null, userRowOptions }) {
  /* ===== STATES & FUNCTIONS ===== */
  const [pageNum, setPageNum] = useState(1);
  const [searchInput, setSearchInput] = useState("");

  // states and functions from the js file
  const { users, updateResults } = UserSearchLogic();

  /* ===== EFFECTS ===== */

  // code that is executed when the component mounts OR when user makes changes pages AND/OR makes a change to the search bar
  useEffect(() => {
    updateResults(searchInput, usersPerPage, pageNum);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageNum]);

  // code that is executed when the component mounts OR when users makes a change to searchbar input
  useEffect(() => {
    if (pageNum === 1) {
      updateResults(searchInput, usersPerPage, pageNum);
    } else {
      setPageNum(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  /* ===== USER SEARCH BAR COMPONENT ===== */
  return (
    <>

      { /* Search bar input for searching for users */ }
      <SearchBarInput itemType={ "user" } input={ searchInput } setInput={ setSearchInput } width={ searchBarWidth } />

      {/* Search results - render the user search results here */}
      { users.data ?
        <Items items={ users.data } emptyMessage={ "No users match your search." }>
          { users.data.map(user => {
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
            })}
        </Items>
      :
        <Loading />
      }

      { /* Pagination controls - Render controls for search results */ }
      <PageControls
        totalItems={ users.total }
        itemsPerPage={ usersPerPage }
        pageNum={ pageNum }
        setPageNum={ setPageNum }
        itemName={ "Users" } 
      />

    </>
  );
};

/* ===== EXPORTS ===== */
export default UserSearch;