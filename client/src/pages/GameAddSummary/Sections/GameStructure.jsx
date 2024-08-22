// fix this disaster... LOL

/* ===== IMPORTS ===== */
import { useEffect } from "react";
import SectionsLogic from "./Sections.js";

function GameStructure({ structure }) {
  /* ===== STATES & FUNCTIONS ===== */

  // states & functions from the js file
  const { assets, fetchAssets } = SectionsLogic();

  /* ===== EFFECTS ===== */

  // code that is executed on component mount
  useEffect(() => {
    fetchAssets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ===== GAME STRUCTURE COMPONENT ===== */
  return (
    <div>
      Game Structure
    </div>
  );
};

/* ===== EXPORTS ===== */
export default GameStructure;