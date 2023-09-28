/* ===== IMPORTS ===== */
import "./RecentSubmissions.css";
import { useSearchParams } from "react-router-dom";
import { useState } from "react";
import GameFilter from "./GameFilter.jsx";
import OtherFilterPopup from "./OtherFilterPopup.jsx";
import Popup from "../../components/Popup/Popup.jsx";
import RecentSubmissionsTable from "../../components/RecentSubmissionsTable/RecentSubmissionsTable.jsx";
import UserFilterPopup from "./UserFilterPopup.jsx";

function RecentSubmissions({ imageReducer }) {
  /* ===== VARIABLES ===== */
  const NUM_SUBMISSIONS = 20;

  /* ===== STATES ===== */
  const [searchParams, setSearchParams] = useSearchParams();
  const [gamePopup, setGamePopup] = useState(undefined);
  const [userPopup, setUserPopup] = useState(undefined);
  const [otherPopup, setOtherPopup] = useState(undefined);

  /* ===== RECENT SUBMISSIONS COMPONENT ===== */
  return (
    <div className="recent-submissions">

      { /* Popups */ }
      <Popup renderPopup={ gamePopup } setRenderPopup={ setGamePopup } width={ "60%" }>
        <GameFilter searchParams={ searchParams } setSearchParams={ setSearchParams } imageReducer={ imageReducer } />
      </Popup>

      { /* Recent submissions header - render the name of the page, as well as the filter buttons */ }
      <div className="recent-submissions-header">
        <h1>Recent Submissions</h1>
        <div className="recent-submissions-btns">
          <button type="button" onClick={ () => setGamePopup(true) }>Filter by Game</button>
          <button type="button" onClick={ () => setUserPopup(true) }>Filter by User</button>
          <button type="button" onClick={ () => setOtherPopup(true) }>Other Filters</button>
        </div>
      </div>

      { /* Render a recent submissions table */ }
      <RecentSubmissionsTable numSubmissions={ NUM_SUBMISSIONS } searchParams={ searchParams } />

      { /* Popups */ }
      <UserFilterPopup 
        popup={ userPopup }
        setPopup={ setUserPopup }
        searchParams={ searchParams }
        setSearchParams={ setSearchParams }
      />
      <OtherFilterPopup 
        popup={ otherPopup }
        setPopup={ setOtherPopup }
        searchParams={ searchParams }
        setSearchParams={ setSearchParams }
      />

    </div>
  );
};

/* ===== EXPORTS ===== */
export default RecentSubmissions;