/* ===== IMPORTS ===== */
import "./RecentSubmissions.css";
import { useSearchParams } from "react-router-dom";
import { useState } from "react";
import RecentSubmissionsTable from "../../components/RecentSubmissionsTable/RecentSubmissionsTable.jsx";
import GameFilterPopup from "./GameFilterPopup.jsx";
import UserFilterPopup from "./UserFilterPopup.jsx";

function RecentSubmissions({ imageReducer }) {
  /* ===== VARIABLES ===== */
  const NUM_SUBMISSIONS = 20;

  /* ===== STATES ===== */
  const [searchParams, setSearchParams] = useSearchParams();
  const [gamePopup, setGamePopup] = useState(undefined);
  const [userPopup, setUserPopup] = useState(undefined);

  /* ===== RECENT SUBMISSIONS COMPONENT ===== */
  return (
    <div className="recent-submissions">

      { /* Recent submissions header - render the name of the page, as well as the filter buttons */ }
      <div className="recent-submissions-header">
        <h1>Recent Submissions</h1>
        <div className="recent-submissions-btns">
          <button onClick={ () => setGamePopup(true) }>Filter by Game</button>
          <button onClick={ () => setUserPopup(true) }>Filter by User</button>
          <button>Other Filters</button>
        </div>
      </div>

      { /* Render a recent submissions table */ }
      <RecentSubmissionsTable numSubmissions={ NUM_SUBMISSIONS } searchParams={ searchParams } />

      { /* Popups */ }
      <GameFilterPopup 
        popup={ gamePopup } 
        setPopup={ setGamePopup } 
        searchParams={ searchParams } 
        setSearchParams={ setSearchParams }
        imageReducer={ imageReducer } 
      />
      <UserFilterPopup 
        popup={ userPopup }
        setPopup={ setUserPopup }
        searchParams={ searchParams }
        setSearchParams={ setSearchParams }
      />

    </div>
  );
};

/* ===== EXPORTS ===== */
export default RecentSubmissions;