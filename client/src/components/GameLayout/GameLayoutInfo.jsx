/* ===== IMPORTS ====== */
import { Link } from "react-router-dom";
import FrontendHelper from "../../helper/FrontendHelper";

function GameLayoutInfo({ category, abb }) {
  /* ===== VARIABLES ===== */
  const types = ["score", "time"];

  /* ===== FUNCTIONS ===== */
  
  // helper functions
  const { capitalize, categoryB2F } = FrontendHelper();

  /* ===== GAME LAYOUT INFO COMPONENT ===== */
  return (
    <div className="game-layout-body-info">

      { /* Header - Render the category of rankings */ }
      <h2>{ categoryB2F(category) } Rankings</h2>
      
      <hr />

      { /* World Records - Render links to each World Record page of a category */ }
      <h3>World Records</h3>
      <div className="game-layout-body-links">
        { types.map(type => {
          return <Link to={ `/games/${ abb }/${ category }/${ type }` } key={ type }>{ capitalize(type) }</Link>
        })}
      </div>

      { /* Medal Tables - Render links to each Medal Table page of a category */ }
      <h3>Medal Tables</h3>
      <div className="game-layout-body-links">
        { types.map(type => {
          return <Link to={ `/games/${ abb }/${ category }/medals/${ type }` } key={ type }>{ capitalize(type) }</Link>
        })}
      </div>

      { /* Totalizers - Render links to each Totalizer page of a category */ }
      <h3>Totalizers</h3>
      <div className="game-layout-body-links">
        { types.map(type => {
          return <Link to={ `/games/${ abb }/${ category }/totalizer/${ type }` } key={ type }>{ capitalize(type) }</Link>
        })}
      </div>
    </div>
  );
};

/* ===== EXPORTS ===== */
export default GameLayoutInfo;