/* ===== IMPORTS ===== */
import { PopupContext } from "../../../utils/Contexts";
import { useContext } from "react";
import styles from "./Popups.module.css";
import Username from "../../../components/Username/Username";

function Insert({ submitting, onInsert }) {
  /* ===== CONTEXTS ===== */

  // popupData & close popup function from popup context
  const { popupData, closePopup } = useContext(PopupContext);

  /* ===== VARIABLES ===== */
  const moderator = popupData;

  /* ===== INSERT COMPONENT ===== */
  return (
    <>
      <h2>Are you sure you want to add <Username profile={ moderator } /> as a moderator?</h2>
      <div className={ `center ${ styles.btns }` }>
        <button type="button" className="cancel" disabled={ submitting } onClick={ closePopup }>Cancel</button>
        <button type="button" disabled={ submitting } onClick={ () => onInsert(moderator, closePopup) }>Add</button>
      </div>
    </>
  );
};

/* ===== EXPORTS ===== */
export default Insert;