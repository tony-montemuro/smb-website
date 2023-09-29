/* ===== IMPORTS ===== */
import "./Popup.css";
import { PopupContext } from "../../utils/Contexts";

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
    <div className="popup">
      <div className="popup-inner" style={ { maxWidth: width } }>

        { /* Render button to close the popup */ }
        <div className="popup-close">
          <button type="button" onClick={ closePopup }>Close</button>
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