/* ===== IMPORTS ===== */
import "./Medals.css";
import { GameContext, MessageContext } from "../../Contexts";
import { useContext, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import FrontendHelper from "../../helper/FrontendHelper";
import GameHelper from "../../helper/GameHelper";
import MedalsLogic from "./Medals.js";
import MedalTable from "./MedalTable";

function Medals({ submissionReducer, imageReducer }) {
  /* ===== VARIABLES ===== */
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname.split("/");
  const abb = path[2];
  const category = path[3];
  const type = path[5];
  const isMisc = category === "misc" ? true : false;

  /* ===== CONTEXTS ===== */

  // game state from game context
  const { game } = useContext(GameContext);
  
  // add message function from message context
  const { addMessage } = useContext(MessageContext);

  /* ===== STATES AND FUNCTIONS ===== */

  // helper functions
  const { capitalize } = FrontendHelper();
  const { hasMiscCategory } = GameHelper();

  // states and functions from the js file
  const { 
    medalTable,
    fetchMedals
  } = MedalsLogic();

  /* ===== EFFECTS ===== */

  // code that is executed when the component mounts, or when the user switches between miscellaneous and main
  useEffect(() => {
    // special case: we are at the path "/games/{abb}/misc/medals/{type}", but the game has no misc charts
    if (category === "misc" && !hasMiscCategory(game)) {
      addMessage("The page you requested does not exist.", "error");
      navigate("/");
      return;
    }

    // if we made it past the special case, let's go ahead and fetch the medal table
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