/* ===== IMPORTS ===== */
import styles from "./UserInfoForm.module.css";
import FrontendHelper from "../../helper/FrontendHelper";

function SectionTitle({ title, hasChanged, onClick }) {
  /* ===== FUNCTIONS ===== */

  // helper functions
  const { snakeToTitle } = FrontendHelper();

  /* ===== SECTION TITLE COMPONENT ===== */
  return (
    <div className={ styles.title }>
      <h3>{ snakeToTitle(title) }</h3>
      { hasChanged(title) && <button type="button" onClick={ () => onClick(title) }>Reset</button> }
    </div>
  );
};

/* ===== EXPORTS ===== */
export default SectionTitle;