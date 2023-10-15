/* ===== IMPORTS ===== */
import { Link } from "react-router-dom";
import styles from "./UserOverview.module.css";
import Avatar from "../../Avatar/Avatar.jsx";
import Container from "../../Container/Container.jsx";
import CountryFlag from "../../CountryFlag/CountryFlag.jsx";

function UserOverview({ profile, imageReducer }) {
  /* ===== VARIABLES ===== */
  const IMG_WIDTH = 300;

  /* ===== USER OVERVIEW COMPONENT ===== */
  return (
    <Container>
      <div className={ styles.userOverview }>

        { /* User avatar and name - link back to the main user page. */ }
        <Link to={ `/user/${ profile.id }` }>
          <Avatar profileId={ profile.id } size={ IMG_WIDTH } imageReducer={ imageReducer }  />
        </Link>
        <Link to={ `/user/${ profile.id }` }>
          <h2>{ profile.username }</h2>
        </Link>

        { /* User country - render the user's country flag and name, if they exist. */ }
        { profile.country &&
          <div className="center">
            <CountryFlag country={ profile.country.iso2 } />
            <p>&nbsp;{ profile.country.name }</p>
          </div>
        }

      </div>
    </Container>
  );
};

/* ===== EXPORTS ===== */
export default UserOverview;