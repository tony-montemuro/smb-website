/* ===== IMPORTS ===== */
import styles from "./GameAddSummary.module.css";
import Container from "../../components/Container/Container.jsx";
import GameAddSummaryLogic from "./GameAddSummary.js";
import GameAssets from "./Sections/GameAssets.jsx";
import GameEntities from "./Sections/GameEntities.jsx";
import GameStructure from "./Sections/GameStructure.jsx";
import Metadata from "./Sections/Metadata.jsx";

function GameAddSummary() {
  /* ===== GAME ADD SUMMARY PAGE ===== */
  return (
    <Container title="Summary">
      <div className={ styles.summary }>
        <GameAssets />
        <GameEntities />
        <GameStructure />
        <Metadata />
      </div>
    </Container>
  )
};

/* ===== EXPORTS ===== */
export default GameAddSummary;