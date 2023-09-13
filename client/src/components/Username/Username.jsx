/* ===== IMPORTS ====== */
import "./Username.css";
import "../../../node_modules/flag-icons/css/flag-icons.min.css";
import { Link } from "react-router-dom";

function Username({ profile, disableLink = false }) {
  /* ===== VARIABLES ===== */
  let country = null;
  if (profile.country) {
    country = profile.country.iso2 ? profile.country.iso2 : profile.country;
  }

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
        profile.username
      :
        <Link to={ `/user/${ profile.id }` }>{ profile.username }</Link>
      }
      
    </div>
  );
};

/* ===== EXPORTS ===== */
export default Username;