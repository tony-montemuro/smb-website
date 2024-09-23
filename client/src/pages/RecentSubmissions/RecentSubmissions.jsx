/* ===== IMPORTS ===== */
import { AppDataContext } from "../../utils/Contexts.js";
import { useContext, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import styles from "./RecentSubmissions.module.css";
import GameFilter from "./ListFilters/GameFilter.jsx";
import OtherFilter from "./OtherFilter/OtherFilter.jsx";
import Popup from "../../components/Popup/Popup.jsx";
import RecentSubmissionsLogic from "./RecentSubmissions.js";
import RecentSubmissionsTable from "../../components/RecentSubmissionsTable/RecentSubmissionsTable.jsx";
import UserFilter from "./ListFilters/UserFilter.jsx";

function RecentSubmissions({ imageReducer }) {
  /* ===== VARIABLES ===== */
  const NUM_SUBMISSIONS = 100;

  /* ===== CONTEXTS ===== */

  // appData state from app data context
  const { appData } = useContext(AppDataContext);

  /* ===== STATES & FUNCTIONS ===== */
  const [searchParams, setSearchParams] = useSearchParams();
  const [gamePopup, setGamePopup] = useState(undefined);
  const [userPopup, setUserPopup] = useState(undefined);
  const [otherPopup, setOtherPopup] = useState(undefined);

  // states & functions from the js file
  const { filtersData, dispatchFiltersData, fetchGames, fetchUsers } = RecentSubmissionsLogic();

  /* ===== EFFECTS ===== */

  // code that is executed when the component mounts
  useEffect(() => {
    fetchGames(searchParams);
    fetchUsers(searchParams);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // code that is executed when the component mounts, and when the `appData.categories` state updates
  useEffect(() => {
    dispatchFiltersData({ type: "categories", value: appData.categories });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appData.categories]);

  /* ===== RECENT SUBMISSIONS COMPONENT ===== */
  return (
    <div className={ styles.recentSubmissions }>

      { /* Popups */ }
      <Popup renderPopup={ gamePopup } setRenderPopup={ setGamePopup } width="1200px">
        <GameFilter 
          searchParams={ searchParams } 
          setSearchParams={ setSearchParams } 
          imageReducer={ imageReducer }
          games={ filtersData.games }
          dispatchFiltersData={ dispatchFiltersData }
        />
      </Popup>
      <Popup renderPopup={ userPopup } setRenderPopup={ setUserPopup } width="1200px" >
        <UserFilter 
          searchParams={ searchParams } 
          setSearchParams={ setSearchParams }
          users={ filtersData.users }
          dispatchFiltersData={ dispatchFiltersData }
        />
      </Popup>
      <Popup renderPopup={ otherPopup } setRenderPopup={ setOtherPopup } width="1200px" >
        <OtherFilter searchParams={ searchParams } setSearchParams={ setSearchParams } categories={ filtersData.categories } />
      </Popup>

      { /* Recent submissions header - render the name of the page, as well as the filter buttons */ }
      <div className={ styles.header }>
        <h1>Recent Submissions</h1>
        <div className={ styles.btns }>
          <button type="button" onClick={ () => setGamePopup(true) }>Filter by Game</button>
          <button type="button" onClick={ () => setUserPopup(true) }>Filter by User</button>
          <button type="button" onClick={ () => setOtherPopup(true) }>Other Filters</button>
        </div>
      </div>

      { /* Render a recent submissions table */ }
      <RecentSubmissionsTable numSubmissions={ NUM_SUBMISSIONS } searchParams={ searchParams } renderGame renderLevelContext />

    </div>
  );
};

/* ===== EXPORTS ===== */
export default RecentSubmissions;