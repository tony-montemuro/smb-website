/* ===== IMPORTS ===== */
import { Link } from "react-router-dom";
import styles from "./Home.module.css";
import FrontendHelper from "../../helper/FrontendHelper";

function HomeContainer({ name, children }) {
  /* ===== FUNCTIONS ===== */

  // helper functions
  const { kebabToTitle } = FrontendHelper();

  /* ===== HOME CONTAINER COMPONENT ===== */
  return (
    <div className={ styles.container }>
      <div className={ styles.containerHeader }>
        <h1><Link to={ `/${ name }` }>{ kebabToTitle(name) }</Link></h1>
      </div>
      <div className={ styles.containerBody }>
        { children }
      </div>
    </div>
  );
};

/* ===== EXPORTS ===== */
export default HomeContainer;