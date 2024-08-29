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
import SimpleLogo from "../../assets/svg/SimpleLogo.jsx";

function GameAddSummary({ imageReducer }) {
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

  /* ===== FUNCTIONS ===== */

  // functions from the js file
  const { createGame } = GameAddSummaryLogic();

  /* ===== GAME ADD SUMMARY PAGE ===== */
  return (
    <Container title="Summary">
      <form className={ styles.summary } onSubmit={ e => createGame(e, metadata, entities, structure) }>
        <span>Use this screen to ensure all information is correct, and to create the game!</span>
        <Metadata metadata={ metadata } />
        <GameEntities entities={ entities } />
        <GameStructure structure={ structure } />
        <GameAssets assets={ assets } imageReducer={ imageReducer } />
        <button type="submit" className="center">
          <SimpleLogo />
          <span>Add Game</span>
        </button>
      </form>
    </Container>
  )
};

/* ===== EXPORTS ===== */
export default GameAddSummary;