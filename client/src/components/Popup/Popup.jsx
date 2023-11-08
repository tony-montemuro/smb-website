/* ===== IMPORTS ===== */
import { useEffect, useRef } from "react";
import { PopupContext } from "../../utils/Contexts";
import styles from "./Popup.module.css";
import CloseButton from "../CloseButton/CloseButton.jsx";
import PopupLogic from "./Popup.js";

function Popup({ renderPopup, setRenderPopup, width, disableClose, children }) {
  /* ===== REFS ===== */
  const innerRef = useRef();

  /* ===== FUNCTIONS ===== */

  // functions from the js file
  const { closePopup, handleClick, handleTouch } = PopupLogic(setRenderPopup, innerRef);

  /* ===== EFFECTS ===== */

  // code that is executed each time the `renderPopup` state changes
  useEffect(() => {
    if (renderPopup) {
      document.body.style.overflow = "hidden";
      document.addEventListener("mousedown", handleClick);
      document.addEventListener("touchstart", handleTouch);
    } else {
      document.body.style.overflow = "visible";
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("touchstart", handleTouch);
    }
    
    // Cleanup function
    return () => {
      document.body.style.overflow = "visible";
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("touchstart", handleTouch);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [renderPopup]);

  /* ===== POPUP COMPONENT ===== */
  return renderPopup &&
    <div className={ styles.popup }>
      <div className={ styles.inner } ref={ innerRef } style={ { maxWidth: width } }>

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