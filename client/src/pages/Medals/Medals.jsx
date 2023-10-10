/* ===== IMPORTS ===== */
import { GameContext, MessageContext } from "../../utils/Contexts";
import { useContext, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "./Medals.module.css";
import FrontendHelper from "../../helper/FrontendHelper";
import GameHelper from "../../helper/GameHelper";
import MedalsLogic from "./Medals.js";
import MedalTable from "./MedalTable";

function Medals({ imageReducer }) {
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
  const abb = path[2];
  const category = path[3];
  const type = path[5];
  const categories = getGameCategories(game);
  const types = getCategoryTypes(game, category);

  /* ===== STATES AND FUNCTIONS ===== */

  // states and functions from the js file
  const { 
    medalTable,
    fetchMedals
  } = MedalsLogic();

  /* ===== EFFECTS ===== */

  // code that is executed when the component mounts, or when the user switches categories
  useEffect(() => {
    // special case #1: we are attempting to access a medals page with a non-valid or non-practice mode category
    if (!(categories.includes(category) && isPracticeMode(category))) {
      addMessage("The page you requested does not exist.", "error");
      navigate("/");
      return;
    }

    // special case #2: we are attempting to access a medals page with a valid category, but an invalid type
    if (!(types.includes(type))) {
      addMessage("The page you requested does not exist.", "error");
      navigate("/");
      return;
    }

    // if we made it past the special case, let's go ahead and fetch the medal table
    fetchMedals(abb, category, type);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);
      
  /* ===== MEDALS COMPONENT ===== */
  return (
    <>
      <div className={ styles.header }>
        <h1>{ capitalize(type) } Medal Table</h1>
        <h2>{ categoryB2F(category) }</h2>
      </div>
      <MedalTable table={ medalTable } imageReducer={ imageReducer } />
    </>
  );
};

/* ===== EXPORTS ===== */
export default Medals;