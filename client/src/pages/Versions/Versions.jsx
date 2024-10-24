/* ===== IMPORTS ===== */
import { useEffect } from "react";
import styles from "./Versions.module.css";
import Container from "../../components/Container/Container.jsx";
import Loading from "../../components/Loading/Loading.jsx";
import SimpleGameSelect from "../../components/SimpleGameSelect/SimpleGameSelect";
import TextField from "@mui/material/TextField";
import VersionsLogic from "./Versions.js";

function Versions({ imageReducer }) {
  /* ===== STATES & FUNCTIONS ===== */
  const componentData = VersionsLogic();
  const { game, games, setGame, queryGames } = componentData;

  /* ===== VARIABLES ===== */
  const versionCount = game?.version.length ? game.version.length : 1;

  /* ===== EFFECTS ===== */

  // code that is executed on component mount
  useEffect(() => {
    queryGames();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ===== VERSIONS COMPONENT ===== */
  return (
    <div className={ styles.versions }>
      <div className={ styles.left }>
        <SimpleGameSelect
          games={ games }
          game={ game }
          setGame={ setGame } 
          imageReducer={ imageReducer }
        />
      </div>

      <div className={ styles.right }>
        <Container title="Game Versions" largeTitle>
          { game ?
            <div className={ styles.header }>
              <h3>On this screen, you are able to add new versions to a game.</h3>
              <span>{ game.name } currently has { versionCount } version(s).</span>
              <hr />
              <VersionsForm formData={ componentData } />
            </div>
          :
            <Loading />
          }
        </Container>
      </div>
    </div>
  );
};

function VersionsForm({ formData }) {
  /* ===== VARIABLES ===== */
  const VERSION_LENGTH_MAX = 10;

  /* ===== FUNCTIONS ===== */
  const { version, handleVersionChange, handleSubmit } = formData;

  return (
    <form className={ styles.versionForm } onSubmit={ handleSubmit }>
      <h2>Add Version</h2>
      <TextField
        helperText={ `${ version.length }/${ VERSION_LENGTH_MAX }` }
        id="version"
        inputProps={ { maxLength: VERSION_LENGTH_MAX } }
        label="Version"
        onChange={ handleVersionChange }
        placeholder={ `Must be ${ VERSION_LENGTH_MAX } characters or less` }
        required
        value={ version }
        variant="filled"
      />
      <button type="submit">Add Version</button>
    </form>
  );
};

/* ===== EXPORTS ===== */
export default Versions;