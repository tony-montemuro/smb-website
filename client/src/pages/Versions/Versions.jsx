/* ===== IMPORTS ===== */
import { useEffect } from "react";
import styles from "./Versions.module.css";
import Container from "../../components/Container/Container.jsx";
import FancyLevel from "../../components/FancyLevel/FancyLevel.jsx";
import LevelHelper from "../../helper/LevelHelper.js";
import Loading from "../../components/Loading/Loading.jsx";
import SimpleGameSelect from "../../components/SimpleGameSelect/SimpleGameSelect";
import TextField from "@mui/material/TextField";
import VersionsLogic from "./Versions.js";

/* ===== COMPONENTS ===== */

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
              <hr />

              { /* Load game structure when loaded */ }
              { game.structure ? 
                <Structure structure={ game.structure } /> 
              : 
                <Loading /> 
              }
            </div>
          :
            <Loading />
          }
        </Container>
      </div>
    </div>
  );
};

function VersionInput({ state, error, sequence = null, onChange, onBlur = () => {} }) {
  /* ===== VARIABLES ===== */
  const VERSION_LENGTH_MAX = 10;
  const key = sequence ? `version_${ sequence }` : "version";

  /* ===== VERSIONS INPUT ===== */
  return (
    <TextField
      autoComplete="false"
      color={ error ? "error" : "primary" }
      error={ error ? true : false }
      className={ styles.versionInput }
      helperText={ error ?? `${ state.length }/${ VERSION_LENGTH_MAX }` }
      id={ key }
      key={ key }
      inputProps={ { maxLength: VERSION_LENGTH_MAX } }
      label="Version"
      onBlur={ onBlur }
      onChange={ onChange }
      placeholder={ `Must be ${ VERSION_LENGTH_MAX } characters or less` }
      required
      value={ state }
      variant="filled"
    />
  );
};

function VersionsForm({ formData }) {
  /* ===== STATES & FUNCTIONS ===== */
  const { version, versions, handleVersionChange, handleSubmit } = formData;

  /* ===== VERSIONS FORM COMPONENT ===== */
  return (
    <form className={ styles.versionForm } onSubmit={ handleSubmit }>
      <h2>Versions</h2>
      { versions.values.map(version => {
        return <VersionItem version={ version } formData={ formData } key={ version.sequence } />;
      })}

      <h3>Add Version</h3>
      <VersionInput
        state={ version.value }
        error={ version.error }
        onChange={ handleVersionChange }
      />
      <button type="submit">Add Version</button>
    </form>
  );
};

function VersionItem({ version, formData }) {
  /* ===== VARIABLES, STATES, & FUNCTIONS ===== */
  const { game, versions, handleVersionsChange, validateVersions } = formData;
  const { id, sequence } = version;
  version = version.version;
  const state = versions.values.find(version => version.sequence === sequence);
  const error = versions.errors[sequence];
  const latest = game.version.length > 0 ? game.version.at(-1).sequence : 1;
  const children = [];

  // build out children components
  if (id) {
    children.push(
      <span key={ `version_${ version.sequence }` }>{ version }</span>
    );
  } else {
    children.push(
      <VersionInput
        state={ state.version }
        error={ error }
        sequence={ sequence }
        onChange={ handleVersionsChange }
        onBlur={ validateVersions }
        key={ `version_${ sequence }` }
      />
    );
  }

  if (sequence === latest) {
    children.push(<em key="version_latest">Current latest version</em>);
  }

  /* ===== VERSIONS COMPONENT ===== */
  return (
    <div className={ styles.item }>
      { children }
    </div>
  );
};

function Structure({ structure }) {
  /* ===== FUNCTIONS ===== */
  
  // helper functions
  const { levelB2F } = LevelHelper();

  /* ===== STRUCTURE COMPONENT ===== */
  return (
    <div id={ styles.structure }>
      <div className={ styles.header }>
        <h2>Chart Update Submissions Tool</h2>
        <span>
          Using this tool, if there exist charts that are unchanged between the <strong>current latest version</strong> and
          any new versions added, you can specify which charts should update all <strong>current</strong> submissions to the
          version specified.
        </span>
      </div>
      
      { structure.map(category => {
        return (
          <div className={ styles.category } key={ category.name }>
            <h3>{ category.name }</h3>
    
            { category.mode.map(mode => {
              return (
                <div className={ styles.mode } key={ mode.name }>
                  <strong>{ levelB2F(mode.name) }</strong>
                  <Levels levels={ mode.level } />
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};

function Levels({ levels }) {
  return (
    <table className={ styles.levels }>
      <tbody>
        { levels.map(level => {
          const levelName = level.name;
          return (
            <tr key={ levelName }>
              <td>
                <FancyLevel level={ levelName } />
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  )
}

/* ===== EXPORTS ===== */
export default Versions;