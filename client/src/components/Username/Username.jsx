/* ===== IMPORTS ====== */
import "./Username.css";
import { Link } from "react-router-dom";
import CountryFlag from "../CountryFlag/CountryFlag";

function Username({ profile, disableLink }) {
  /* ===== USERNAME COMPONENT ===== */
  return (
    <div className="username">

      { /* Render the countries flag, if it exists */ }
      <CountryFlag country={ profile.country } />

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