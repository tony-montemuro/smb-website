/* ===== IMPORTS ===== */
import { GameAddContext } from "../../../utils/Contexts.js";
import { useContext, useEffect } from "react";
import Loading from "../../../components/Loading/Loading.jsx";
import SectionsLogic from "./Sections.js";
import styles from "./Sections.module.css";

function GameAssets({ assets, imageReducer }) {
  /* ===== CONTEXTS ===== */

  // assetsData variable from game add context
  const { assetsData } = useContext(GameAddContext);

  /* ===== STATES & FUNCTIONS ===== */

  // states & functions from the js file
  const { images, fetchAssets } = SectionsLogic(imageReducer);

  /* ===== EFFECTS ===== */

  // code that is executed on component mount
  useEffect(() => {
    fetchAssets(assets);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ===== GAME ASSETS COMPONENT ===== */
  return (
    <div className={ styles.section }>
      <h2>Game Assets</h2>
      <hr />
      <div className={ styles.sectionContent }>
        { images ?
          images.boxArt ?
            <div className={ styles.asset }>
              <h3>Box Art</h3>
              <img src={ images.boxArt } alt="boxArt" style={ { 
                "width": assetsData.boxArt.dimensions.MAX_WIDTH, 
                "height": assetsData.boxArt.dimensions.MAX_HEIGHT 
              } } />
            </div>
          :
            <span><em>No assets uploaded.</em></span>
        :
          <Loading />
        }
      </div>
    </div>
  );
};

/* ===== EXPORTS ===== */
export default GameAssets;