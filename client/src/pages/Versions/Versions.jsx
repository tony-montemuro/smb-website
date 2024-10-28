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
  const { 
    game,
    games,
    queryGames,
    switchGame
  } = componentData;

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
    <div id="content" className={ styles.versions }>
      <div className={ styles.left }>
        <SimpleGameSelect
          games={ games }
          game={ game }
          setGame={ switchGame } 
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
  /* ===== STATES & FUNCTIONS ===== */
  const { game, version, versions, handleVersionChange, handleSubmit } = formData;

  /* ===== VARIABLES ===== */
  const VERSION_LENGTH_MAX = 10;
  const latest = game.version.length > 0 ? game.version.at(-1).sequence : 1;

  return (
    <form className={ styles.versionForm } onSubmit={ handleSubmit }>
      <h2>Versions</h2>
      { versions.map(version => {
        return (
          <div className={ styles.item } key={ version.sequence }>
            <span>{ version.version }</span>
            { version.sequence === latest && <em>Current latest version</em> }
          </div>
        );
      })}
      <h3>Add Version</h3>
      <TextField
        autoComplete="false"
        color={ version.error ? "error" : "primary" }
        error={ version.error ? true : false }
        helperText={ version.error ?? `${ version.value.length }/${ VERSION_LENGTH_MAX }` }
        id="version"
        inputProps={ { maxLength: VERSION_LENGTH_MAX } }
        label="Version"
        onChange={ handleVersionChange }
        placeholder={ `Must be ${ VERSION_LENGTH_MAX } characters or less` }
        required
        value={ version.value }
        variant="filled"
      />
      <button type="submit">Add Version</button>
    </form>
  );
};

/* ===== EXPORTS ===== */
export default Versions;