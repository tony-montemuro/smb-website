/* ===== IMPORTS ===== */
import { GameAddContext } from "../../utils/Contexts.js";
import { useContext } from "react";
import styles from "./GameAddSummary.module.css";
import Container from "../../components/Container/Container.jsx";
import GameAddSummaryLogic from "./GameAddSummary.js";
import GameAssets from "./Sections/GameAssets.jsx";
import GameEntities from "./Sections/GameEntities.jsx";
import GameStructure from "./Sections/GameStructure.jsx";
import Metadata from "./Sections/Metadata.jsx";

function GameAddSummary() {
  /* ===== CONTEXTS ===== */

  // keys object from game add context
  const { keys } = useContext(GameAddContext);

  /* ===== VARIABLES ===== */
  
  // keys
  const metadataKey = keys.metadata;
  const entitiesKey = keys.entities;
  const structureKey = keys.structure;
  const assetsKey = keys.assets;

  // objects
  const metadata = JSON.parse(localStorage.getItem(metadataKey));
  const entities = JSON.parse(localStorage.getItem(entitiesKey));
  const structure = JSON.parse(localStorage.getItem(structureKey));
  const assets = JSON.parse(localStorage.getItem(assetsKey));

  /* ===== GAME ADD SUMMARY PAGE ===== */
  return (
    <Container title="Summary">
      <div className={ styles.summary }>
        <Metadata metadata={ metadata } />
        <GameEntities entities={ entities } />
        <GameStructure structure={ structure } />
        <GameAssets assets={ assets } />
      </div>
    </Container>
  )
};

/* ===== EXPORTS ===== */
export default GameAddSummary;