/* ===== IMPORTS ====== */
import "./Username.css";
import "../../../node_modules/flag-icons/css/flag-icons.min.css";
import { Link } from "react-router-dom";

function Username({ country, userId, username }) {
  /* ===== USERNAME COMPONENT ===== */
  return (
    <div className="username">

      { /* Render the countries flag, if it exists */ }
      { country &&
        <>
          <span className={ `fi fi-${ country.toLowerCase() }` }></span>
          &nbsp;
        </>
      }

      { /* Using the userId, create a link to the user's page. */ }
      <Link to={ `/user/${ userId }` }>{ username }</Link>
      
    </div>
  );
};

/* ===== EXPORTS ===== */
export default Username;