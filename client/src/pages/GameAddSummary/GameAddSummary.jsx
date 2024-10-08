/* ===== IMPORTS ===== */
import { GameAddContext } from "../../utils/Contexts.js";
import { useContext, useState } from "react";
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

  /* ===== STATES ===== */
  const [error, setError] = useState({
    metadata: undefined,
    entities: undefined,
    structure: undefined
  });
  const [submitting, setSubmitting] = useState(false);

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
  const { createGame } = GameAddSummaryLogic(setError, setSubmitting);

  /* ===== GAME ADD SUMMARY PAGE ===== */
  return (
    <Container title="Summary">
      <form className={ styles.summary } onSubmit={ e => createGame(e, metadata, entities, structure, assets) }>
        <span>Use this screen to ensure all information is correct, and to create the game!</span>

        { metadata && entities && structure &&
          <>
            <Metadata metadata={ metadata } error={ error.metadata } />
            <GameEntities entities={ entities } error={ error.entities } />
            <GameStructure structure={ structure } error={ error.structure } />
            <GameAssets assets={ assets } imageReducer={ imageReducer } />
            <button type="submit" className="center" disabled={ submitting }>
              <SimpleLogo />
              <h3>Add Game</h3>
            </button>         
          </>
        }
        
      </form>
    </Container>
  )
};

/* ===== EXPORTS ===== */
export default GameAddSummary;