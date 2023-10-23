/* ===== IMPORTS ===== */
import { ProfileContext } from "../../../utils/Contexts";
import { Link } from "react-router-dom";
import { useContext } from "react";
import styles from "./UserOverview.module.css";
import Avatar from "../../Avatar/Avatar.jsx";
import Container from "../../Container/Container.jsx";
import CountryFlag from "../../CountryFlag/CountryFlag.jsx";
import UserLayoutLogic from "../UserLayout.js";

function UserOverview({ imageReducer }) {
  /* ===== CONTEXTS ===== */

  // profile state from profile context
  const { profile } = useContext(ProfileContext);

  /* ===== VARIABLES ===== */
  const IMG_WIDTH = 300;

  /* ===== FUNCTIONS ===== */

  // functions from the js file
  const { scrollToRight } = UserLayoutLogic();

  /* ===== USER OVERVIEW COMPONENT ===== */
  return (
    <Container>
      <div className={ styles.userOverview }>

        { /* User avatar and name - link back to the main user page. */ }
        <Link to={ `/user/${ profile.id }` } onClick={ scrollToRight }>
          <Avatar profileId={ profile.id } size={ IMG_WIDTH } imageReducer={ imageReducer }  />
        </Link>
        <Link to={ `/user/${ profile.id }` } onClick={ scrollToRight }>
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