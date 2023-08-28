/* ===== IMPORTS ===== */
import "./Totalizer.css";
import { GameContext, MessageContext } from "../../utils/Contexts";
import { useLocation, useNavigate } from "react-router-dom";
import { useContext, useEffect } from "react";
import FrontendHelper from "../../helper/FrontendHelper";
import GameHelper from "../../helper/GameHelper";
import TotalizerLogic from "./Totalizer.js";
import TotalizerTable from "./TotalizerTable";

function Totalizer({ imageReducer, submissionCache }) {
  /* ===== CONTEXTS ===== */

  // game state from game context
  const { game } = useContext(GameContext);

  // add message function from message context
  const { addMessage } = useContext(MessageContext);

  /* ===== HELPER FUNCTIONS ===== */
  const { capitalize, categoryB2F } = FrontendHelper();
  const { getGameCategories, getCategoryTypes, isPracticeMode } = GameHelper();
  

  /* ===== VARIABLES ===== */
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname.split("/");
  const category = path[3];
  const type = path[5];
  const categories = getGameCategories(game);
  const types = getCategoryTypes(game, category);

  /* ===== STATES AND FUNCTIONS ===== */

  // states and functions from the js file
  const {
    totals,
    fetchTotals
  } = TotalizerLogic();

  /* ===== EFFECTS ===== */

  // code that is executed when the component mounts, or when the user switches categories
  useEffect(() => {
    // special case #1: we are attempting to access a totalizer page with a non-valid category or non-practice mode category
    if (!(categories.includes(category) && isPracticeMode(category))) {
      addMessage("The page you requested does not exist.", "error");
      navigate("/");
      return;
    }

    // special case #2: we are attempting to access a totalizer page with a valid category, but an invalid type
    if (!(types.includes(type))) {
      addMessage("The page you requested does not exist.", "error");
      navigate("/");
      return;
    }

    // if we made it past the special case, let's go ahead and compute the totals
    fetchTotals(game, category, type, submissionCache);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  /* ===== TOTALIZER COMPONENT ===== */
  return totals ? 
    <>

    { /* Totalizer Header - Render the title of the totalizer. */ }
      <div className="totalizer-header">
        <h1>{ categoryB2F(category) } - { capitalize(type) } Totalizer</h1>
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