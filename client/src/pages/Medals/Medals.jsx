/* ===== IMPORTS ===== */
import "./Medals.css";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import FrontendHelper from "../../helper/FrontendHelper";
import MedalsLogic from "./Medals.js";
import MedalTable from "./MedalTable";

function Medals({ submissionReducer, imageReducer }) {
  /* ===== VARIABLES ===== */
  const location = useLocation();
  const path = location.pathname.split("/");
  const abb = path[2];
  const category = path[3];
  const type = path[5];
  const isMisc = category === "misc" ? true : false;

  /* ===== STATES AND FUNCTIONS ===== */

  // helper functions
  const { capitalize } = FrontendHelper();

  // states and functions from the js file
  const { 
    medalTable,
    fetchMedals
  } = MedalsLogic();

  /* ===== EFFECTS ===== */

  // code that is executed when the component mounts, or when the user switches between miscellaneous and main
  useEffect(() => {
    fetchMedals(abb, category, type, submissionReducer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);
      
  /* ===== MEDALS COMPONENT ===== */
  return medalTable ?
    // Medals Header - Displays the name of the game, as well as buttons to navigate to related pages.
    <>
      <div className="medals-header">

        { /* Game Title */ }
        <h1>{ isMisc && "Miscellaneous" } { capitalize(type) } Medal Table</h1>

      </div>

      { /*  Medals Body - Render both the score and time medal tables. */ }
      <div className="medals-body">
        <MedalTable table={ medalTable } imageReducer={ imageReducer } />
      </div>

    </>
  :
    // Loading component
    <p>Loading...</p>
};

/* ===== EXPORTS ===== */
export default Medals;