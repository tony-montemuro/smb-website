/* ===== IMPORTS ===== */
import { memo, useEffect, useMemo, useState } from "react";
import styles from "./Versions.module.css";
import Container from "../../components/Container/Container.jsx";
import Checkbox from "@mui/material/Checkbox";
import FancyLevel from "../../components/FancyLevel/FancyLevel.jsx";
import LevelHelper from "../../helper/LevelHelper.js";
import Loading from "../../components/Loading/Loading.jsx";
import SimpleGameSelect from "../../components/SimpleGameSelect/SimpleGameSelect";
import VersionInput from "./VersionInput/VersionInput.jsx";
import VersionsLogic from "./Versions.js";

/* ===== COMPONENTS ===== */

function Versions({ imageReducer }) {
  /* ===== STATES & FUNCTIONS ===== */
  const componentData = VersionsLogic();
  const { 
    game,
    games,
    versions,
    queryGames,
    switchGame,
    onVersionCheck,
    toggleAllPerCategory,
    toggleAllPerMode
  } = componentData;

  /* ===== VARIABLES ===== */
  const versionCount = game?.version.length ? game.version.length : 1;
  const isRenderStructure = (game?.version.length === 0 && versions?.length > 1) || 
    (game?.version.length > 0 && versions?.length > 0);
  

  /* ===== MEMOS ===== */
  const newVersions = useMemo(() => {
    return versions.filter(version => !version.id && version.sequence > 1);
  }, [versions]);

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

              { /* Load game structure when loaded */ }
              { isRenderStructure ? 
                game.structure ?
                  <Structure
                    structure={ game.structure }
                    versions={ newVersions }
                    onVersionCheck={ onVersionCheck }
                    toggleAllPerCategory={ toggleAllPerCategory }
                    toggleAllPerMode={ toggleAllPerMode }
                  />
                :
                  <Loading /> 
              : 
                null 
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

function VersionsForm({ formData }) {
  /* ===== STATES & FUNCTIONS ===== */
  const { versions, handleNewVersionSubmit } = formData;

  /* ===== VERSIONS FORM COMPONENT ===== */
  return (
    <form className={ styles.versionForm }>
      <h2>Versions</h2>
      { versions.map(version => {
        return <VersionItem version={ version } formData={ formData } key={ version.sequence } />;
      })}

      <h3>Add Version</h3>
      <VersionInput versions={ versions } addBtnSubmit={ handleNewVersionSubmit } />
    </form>
  );
};

function VersionItem({ version, formData }) {
  /* ===== VARIABLES, STATES, & FUNCTIONS ===== */
  const { game, versions, handleVersionsChange } = formData;
  const { id, sequence } = version;
  version = version.version;
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
        versions={ versions }
        currentVersion={ version } 
        updateVersions={ handleVersionsChange } 
        sequence={ sequence } 
        key={ sequence } 
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

const Structure = memo(function Structure({ structure, versions, onVersionCheck, toggleAllPerCategory, toggleAllPerMode }) {
  /* ===== FUNCTIONS ===== */ 
  
  // helper functions
  const { levelB2F } = LevelHelper();

  /* ===== STRUCTURE COMPONENT ===== */
  return (
    <div id={ styles.structure }>
      <hr />
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
            <div className={ styles.categoryHeader }>
              <h3>{ category.name }</h3>
              <div>
                { versions.map(version => {
                  let isAllChecked = true;
                  category.mode.forEach(mode => {
                    if (!mode.level.every(level => level.version === version.version)) {
                      isAllChecked = false;
                    }
                  });

                  return (
                    <Checkbox
                      checked={ isAllChecked } 
                      name={ `${ version.version }:${ category.name }` }
                      onChange={ toggleAllPerCategory } 
                      inputProps={{ "aria-label": "controlled" }}
                      sx={{ padding: 0 }}
                      key={ version.version }
                    />
                  );
                })}
              </div>
            </div>
    
            { category.mode.map(mode => {
              return (
                <div className={ styles.mode } key={ mode.name }>
                  <h3>{ levelB2F(mode.name) }</h3>
                  <Levels 
                    levels={ mode.level }
                    versions={ versions }
                    category={ category.name }
                    mode={ mode.name }
                    onVersionCheck={ onVersionCheck }
                    toggleAllPerMode={ toggleAllPerMode }
                  />
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
});

function Levels({ levels, versions, category, mode, onVersionCheck, toggleAllPerMode }) {
  /* ===== LEVELS COMPONENT ===== */
  return (
    <table className={ styles.levels }>
      <thead>
        <tr>
          <th>Chart</th>
          { versions.map(version => {
            const isAllChecked = levels.every(level => level.version === version.version);
            return (
              <th key={ version.version }>
                <Checkbox
                  checked={ isAllChecked } 
                  name={ `${ version.version }:${ category }:${ mode }` }
                  onChange={ toggleAllPerMode } 
                  inputProps={{ "aria-label": "controlled" }}
                  sx={{ padding: 0 }}
                />
                { version.version }
              </th>
            );
          })}
        </tr>
      </thead>

      <tbody>
        { levels.map(level => {
          return (
            <LevelRow 
              level={ level }
              versions={ versions }
              category={ category }
              onVersionCheck={ onVersionCheck }
              key={ level.name } 
            />
          );
        })}
      </tbody>
    </table>
  )
};

function LevelRow({ level, versions, category, onVersionCheck }) {
  /* ===== STATES ===== */
  const [version, setVersion] = useState(undefined);

  /* ===== FUNCTIONS ===== */
  const handleChange = e => {
    const { name } = e.target;
    const nameParts = name.split(":");
    const newVersion = nameParts[0];
    setVersion(newVersion === version ? undefined : newVersion);

    // This is a "hack" that improves performance - allows "frontend" focused state, that being `checkedBox`
    // to render BEFORE we attempt to update the larger, less performant "game" state
    setTimeout(() => {
      onVersionCheck(e);
    }, [0]);
  };

  /* ===== VARIABLES ===== */
  const name = level.name;

  /* ===== EFFECTS ===== */

  // code that executes each time the level parameter changes
  useEffect(() => {
    setVersion(level.version);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level]);

  /* ===== LEVEL ROW COMPONENT ===== */
  return (
    <tr>
      <td className={ styles.levelColumn }>
        <FancyLevel level={ name } />
      </td>
      { versions.map(v => {
        const value = v.version;
        return (
          <td key={ value }>
            <Checkbox 
              checked={ value === version } 
              name={ `${ value }:${ category }:${ name }` }
              onChange={ handleChange } 
              inputProps={{ "aria-label": "controlled" }}
              sx={{ padding: 0 }}
            />
          </td>
        );
      })}
    </tr>
  );
};

/* ===== EXPORTS ===== */
export default Versions;