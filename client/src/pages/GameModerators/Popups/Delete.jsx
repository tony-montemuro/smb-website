/* ===== IMPORTS ===== */
import { PopupContext } from "../../../utils/Contexts";
import { useContext } from "react";
import styles from "./Popups.module.css";
import Username from "../../../components/Username/Username";

function Delete({ submitting, onDelete }) {
  /* ===== CONTEXTS ===== */

  // popup data state & close popup from popup context
  const { popupData, closePopup } = useContext(PopupContext);

  /* ===== VARIABLES ===== */
  const moderator = popupData;

  /* ===== DELETE COMPONENT ===== */
  return (
    <>
      <h2>Are you sure you want to remove <Username profile={ moderator } /> as a moderator?</h2>
      <div className={ `center ${ styles.btns }` }>
        <button type="button" id="cancel" disabled={ submitting } onClick={ closePopup }>Cancel</button>
        <button type="button" disabled={ submitting } onClick={ () => onDelete(moderator, closePopup) }>Remove</button>
      </div>
    </>
  );
};

/* ===== EXPORTS ===== */
export default Delete;