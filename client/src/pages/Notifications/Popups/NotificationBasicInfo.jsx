/* ===== IMPORTS ===== */
import { CategoriesContext } from "../../../utils/Contexts.js";
import { Link } from "react-router-dom";
import { useContext } from "react";
import FancyLevel from "../../../components/FancyLevel/FancyLevel.jsx";
import FrontendHelper from "../../../helper/FrontendHelper";

function NotificationBasicInfo({ notification }) {
  /* ===== CONTEXTS ===== */

  // categories state from categories context
  const { categories } = useContext(CategoriesContext);

  /* ===== VARIABLES ===== */
  const category = notification.level.category;
  const { name: categoryName } = categories[category];
  
  /* ===== FUNCTIONS ===== */

  // helper functions
  const { capitalize } = FrontendHelper();

  /* ===== NOTIFICATION BASIC INFO COMPONENT ===== */
  return ( 
    <>
      <li>
        Game:&nbsp;<Link to={`/games/${ notification.level.mode.game.abb }`}>{ notification.level.mode.game.name }</Link> 
      </li>
      <li>
        Category: { categoryName }
      </li>
      <li>
        Chart:&nbsp;
        <Link to={`/games/${ notification.level.mode.game.abb }/${ category }/${ notification.score ? "score" : "time" }/${ notification.level.name }`}>
          <div><FancyLevel level={ notification.level.name } />&nbsp;({ capitalize(notification.score ? "score" : "time") })</div>
        </Link>
      </li>
    </>
  );
};

/* ===== EXPORTS ===== */
export default NotificationBasicInfo;