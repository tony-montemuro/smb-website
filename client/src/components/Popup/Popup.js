const Popup = (setRenderPopup, innerRef) => {
    /* ===== FUNCTIONS ===== */

    // FUNCTION 1: closePopup - simple function that, when called, will close a particular popup component
    // PRECONDITIONS (1 condition):
    // the `renderPopup` state should be set to true when this function is called
    // POSTCONDITIONS (1 possible outcome):
    // the `renderPopup` state is set to false by calling the setter functions with the `false` argument
    const closePopup = () => setRenderPopup(false);

    // FUNCTION 2: handleClick - code that executes each time the user performs the "mousedown" action when the popup is open
    // PRECONDITIONS (1 parameter):
    // 1.) e: an event object generated each time the user performs the "mousedown" action while the popup is open
    // POSTCONDITIONS (2 possible outcomes):
    // if we are clicking within the popup, this function does nothing
    // if we are clicking outside the popup, this function closes the popup
    const handleClick = e => {
        if (!innerRef.current.contains(e.target)) {
            closePopup();
        }
    }

    // FUNCTION 3: handleTouch - code that executes each time a mobile user performs the "touchend" action when the popup is open
    // PRECONDITIONS (1 parameter):
    // 1.) e: an event object generated each time the user performs the "mousedown" action while the popup is open
    // POSTCONDITIONS (2 possible outcomes):
    // if we are touching within the popup, this function does nothing
    // if we are touching outside the popup, this function closes the popup
    const handleTouch = e => {
        if (!innerRef.current.contains(e.changedTouches[0].target)) {
            closePopup();
        }
    };

    return { closePopup, handleClick, handleTouch };
};

/* ===== EXPORTS ===== */
export default Popup;