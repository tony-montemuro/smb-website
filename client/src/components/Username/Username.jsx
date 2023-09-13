/* ===== IMPORTS ====== */
import "./Username.css";
import "../../../node_modules/flag-icons/css/flag-icons.min.css";
import { Link } from "react-router-dom";

function Username({ country, profileId, username, disableLink = false }) {
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

      { /* If the `disableLink` property is set to true, just render the username. Otherwise, using the profileId, render a link to
      the user's profile. */ }
      { disableLink ?
        username
      :
        <Link to={ `/user/${ profileId }` }>{ username }</Link>
      }
      
    </div>
  );
};

/* ===== EXPORTS ===== */
export default Username;