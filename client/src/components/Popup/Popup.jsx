/* ===== IMPORTS ===== */
import { red } from "@mui/material/colors";
import { PopupContext } from "../../utils/Contexts";
import styles from "./Popup.module.css";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";

function Popup({ renderPopup, setRenderPopup, width, children }) {
  /* ===== FUNCTIONS ===== */

  // FUNCTION 1: closePopup - simple function that, when called, will close a particular popup component
  // PRECONDITIONS (1 condition):
  // the `renderPopup` state should be set to true when this function is called
  // POSTCONDITIONS (1 possible outcome):
  // the `renderPopup` state is set to false by calling the `setRenderPopup` setter function with the `false` argument
  const closePopup = () => setRenderPopup(false);

  /* ===== POPUP COMPONENT ===== */
  return renderPopup &&
    <div className={ styles.popup }>
      <div className={ styles.inner } style={ { maxWidth: width } }>

        { /* Render button to close the popup */ }
        <div id={ styles.close }>
          <button type="button" onClick={ closePopup }>
            <CloseRoundedIcon fontSize="large" sx={ { color: red[500] } } />
          </button>
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