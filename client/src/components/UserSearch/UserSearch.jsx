/* ===== IMPORTS ===== */
import { useEffect, useState } from "react";
import styles from "./UserSearch.module.css";
import Items from "../Items/Items.jsx";
import Loading from "../Loading/Loading.jsx";
import PageControls from "../PageControls/PageControls.jsx";
import SearchBarInput from "../SearchBarInput/SearchBarInput";
import UserSearchLogic from "./UserSearch.js";
import UserRow from "../UserRow/UserRow.jsx";

function UserSearch({ usersPerPage, imageReducer = null, userRowOptions }) {
  /* ===== STATES & FUNCTIONS ===== */
  const [pageNum, setPageNum] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [isComponentMounted, setIsComponentMounted] = useState(false);

  // states and functions from the js file
  const { users, searchUsers } = UserSearchLogic();

  /* ===== EFFECTS ===== */

  // code that is excuted when the component mounts
  useEffect(() => {
    setIsComponentMounted(true);
  }, []);

  // code that is executed when the component mounts OR when user makes changes pages AND/OR makes a change to the search bar
  useEffect(() => {
    if (isComponentMounted) {
      searchUsers(searchInput, usersPerPage, pageNum);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageNum]);

  // code that is executed when the component mounts OR when users makes a change to searchbar input
  useEffect(() => {
    if (pageNum === 1) {
      searchUsers(searchInput, usersPerPage, pageNum);
    } else {
      setPageNum(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  /* ===== USER SEARCH BAR COMPONENT ===== */
  return (
    <>

      { /* Search bar input for searching for users */ }
      <SearchBarInput itemType="user" input={ searchInput } setInput={ setSearchInput } />

      {/* Search results - render the user search results here */}
      { users.data ?
        <Items items={ users.data } emptyMessage="No users match your search.">
          <div className={ styles.results }>
            { users.data.map((user, index) => {
                return (
                  <UserRow 
                    user={ user }
                    imageReducer={ imageReducer } 
                    onClick={ userRowOptions.onUserRowClick }
                    index={ index }
                    disableLink={ userRowOptions.disableLink }
                    isDetailed={ userRowOptions.isDetailed } 
                    key={ user.id } 
                  />
                );
              })}
          </div>
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
        itemName="Users" 
      />

    </>
  );
};

/* ===== EXPORTS ===== */
export default UserSearch;