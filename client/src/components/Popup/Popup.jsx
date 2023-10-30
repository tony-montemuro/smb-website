/* ===== IMPORTS ===== */
import { PopupContext } from "../../utils/Contexts";
import styles from "./Popup.module.css";
import CloseButton from "../CloseButton/CloseButton.jsx";

function Popup({ renderPopup, setRenderPopup, width, disableClose, children }) {
  /* ===== FUNCTIONS ===== */

  // FUNCTION 1: closePopup - simple function that, when called, will close a particular popup component
  // PRECONDITIONS (1 condition):
  // the `renderPopup` state should be set to true when this function is called
  // POSTCONDITIONS (1 possible outcome):
  // the `renderPopup` state is set to false by calling the setter functions with the `false` argument
  const closePopup = () => setRenderPopup(false);

  /* ===== POPUP COMPONENT ===== */
  return renderPopup &&
    <div className={ styles.popup }>
      <div className={ styles.inner } style={ { maxWidth: width } }>

        { /* Render button to close the popup */ }
        <div className={ styles.close }>
          <CloseButton onClose={ closePopup } disableClose={ disableClose } />
        </div>

        { /* Render component children, and give children access to the `closePopup` function */ }
        <PopupContext.Provider value={ { popupData: renderPopup, closePopup } }>
          { children }
        </PopupContext.Provider>

      </div>
    </div>;
};

/* ===== EXPORTS ===== */
export default Popup;