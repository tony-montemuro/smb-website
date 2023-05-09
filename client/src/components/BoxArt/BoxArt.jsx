/* ===== IMPORTS ===== */
import { useEffect } from "react";
import BoxArtLogic from "./BoxArt.js";

function BoxArt({ game, imageReducer, width }) {
  /* ===== STATES & FUNCTIONS ===== */
  const { box, fetchBoxArt } = BoxArtLogic();

  /* ===== EFFECTS ===== */

  // code that is executed when the component is mounted
  useEffect(() => {
    fetchBoxArt(game.abb, imageReducer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ===== BOX ART COMPONENT ===== */
  return <img style={ { width: width, height: 'auto' } } src={ box } alt={ `${ game.name } Box Art` }></img>;
};

/* ===== EXPORTS ===== */
export default BoxArt;