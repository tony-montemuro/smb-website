/* ===== IMPORTS ===== */
import "./Totalizer.css";
import { GameContext } from "../../Contexts";
import { useLocation } from "react-router-dom";
import { useContext, useEffect } from "react";
import FrontendHelper from "../../helper/FrontendHelper";
import TotalizerLogic from "./Totalizer.js";
import TotalizerTable from "./TotalizerTable";

function Totalizer({ imageReducer, submissionReducer }) {
  /* ===== VARIABLES ===== */
  const location = useLocation();
  const path = location.pathname.split("/");
  const category = path[3];
  const type = path[5];
  const isMisc = category === "misc" ? true : false;

  /* ===== CONTEXTS ===== */

  // game state from game context
  const { game } = useContext(GameContext);

  /* ===== STATES AND FUNCTIONS ===== */

  // helper functions
  const { capitalize } = FrontendHelper();

  // states and functions from the js file
  const {
    totals,
    fetchTotals
  } = TotalizerLogic();

  /* ===== EFFECTS ===== */

  // code that is executed when the component mounts, or when the user switches between miscellaneous and main
  useEffect(() => {
    fetchTotals(game, category, type, submissionReducer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  /* ===== TOTALIZER COMPONENT ===== */
  return totals ? 
    <>

    { /* Totalizer Header - Render the title of the totalizer, based on category and type. */ }
      <div className="totalizer-header">
        <h1>{ isMisc && "Miscellaneous" } { capitalize(type) } Totalizer</h1>
      </div>

      { /* Totalizer Body - Render the { type } totalizer table. */ }
      <div className="totalizer-body">
        <TotalizerTable type={ type } totals={ totals } imageReducer={ imageReducer } />
      </div>

    </>
  :
    // Loading component
    <p>Loading...</p>
};

/* ===== EXPORTS ===== */
export default Totalizer;