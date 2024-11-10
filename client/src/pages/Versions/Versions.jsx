/* ===== IMPORTS ===== */
import { memo, useEffect, useMemo, useState } from "react";
import styles from "./Versions.module.css";
import AddIcon from "@mui/icons-material/Add";
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
    toggleAll,
    toggleAllPerCategory,
    toggleAllPerMode,
    handleStructureSubmit
  } = componentData;

  /* ===== VARIABLES ===== */
  const versionCount = game?.version.length ? game.version.length : 1;

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
              { newVersions.length > 0 ? 
                game.structure ?
                  <Structure
                    structure={ game.structure }
                    versions={ newVersions }
                    onVersionCheck={ onVersionCheck }
                    toggleAll={ toggleAll }
                    toggleAllPerCategory={ toggleAllPerCategory }
                    toggleAllPerMode={ toggleAllPerMode }
                    onSubmit={ handleStructureSubmit }
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

const Structure = memo(function Structure({ 
  structure,
  versions,
  onVersionCheck,
  toggleAllPerCategory,
  toggleAllPerMode,
  toggleAll,
  onSubmit
}) {
  /* ===== VARIABLES ===== */
  const checks = {};

  /* ===== FUNCTIONS ===== */ 
  
  // helper functions
  const { levelB2F } = LevelHelper();

  /* ===== STRUCTURE COMPONENT ===== */
  return (
    <form id={ styles.structure } onSubmit={ onSubmit }>
      <hr />
      <div className={ styles.header }>
        <h2>Chart Update Submissions Tool</h2>
        <span>
          Using this tool, if there exist charts that are unchanged between the <strong>current latest version</strong> and
          any new versions added, you can specify which charts should update all submissions on the&nbsp;
          <strong>current latest version</strong> to the version specified.
        </span>
      </div>
      <div className={ `${ styles.structureHeader } ${ styles.all }` }>
        <div className={ styles.boxPadding }>
          <h2>Versions</h2>
        </div>
        <div className={ styles.structureVersions }>
          { versions.map(version => {
            checks[version.version] = {};
            structure.forEach(category => {
              checks[version.version][category.name] = {};
              category.mode.forEach(mode => {
                checks[version.version][category.name][mode.name] = mode.level.every(level => level.version === version.version); 
              });
            });

            return (
              <div className={ styles.toggleAll } key={ version.version }>
                <span>{ version.version }</span>
                <Checkbox
                  checked={ Object.values(checks[version.version]).every(category => Object.values(category).every(val => val)) }
                  name={ version.version }
                  onChange={ toggleAll }
                  inputProps={{ "aria-label": "controlled" }}
                  sx={{ padding: "1px" }}
                  key={ version.version }
                />
              </div>
            );
          })}
        </div>
      </div>
      
      <div className={ styles.structureInner }>
        { structure.map(category => {
          return (
            <div className={ styles.category } key={ category.name }>
              <div className={ `${ styles.structureHeader } ${ styles.categoryHeader }` }>
                <h3 className={ styles.boxPadding }>{ category.name }</h3>
                <div className={ styles.structureVersions }>
                  { versions.map(version => {
                    return (
                      <Checkbox
                        checked={ Object.values(checks[version.version][category.name]).every(val => val) } 
                        onChange={ (e) => toggleAllPerCategory(e.target.checked, version.version, category) } 
                        inputProps={{ "aria-label": "controlled" }}
                        sx={{ padding: "1px" }}
                        key={ version.version }
                      />
                    );
                  })}
                </div>
              </div>
      
              <div className={ styles.modes }>
                { category.mode.map(mode => {
                  return (
                    <div className={ styles.mode } key={ mode.name }>
                      <div className={ `${ styles.structureHeader } ${ styles.modeHeader }` }>
                        <div className={ styles.boxPadding }>
                          <h3 className={ styles.modeTitle }>{ levelB2F(mode.name) }</h3>
                        </div>
                        <div className={ styles.structureVersions }>
                          { versions.map(version => {
                            return (
                              <Checkbox
                                checked={ checks[version.version][category.name][mode.name] } 
                                onChange={ (e) => toggleAllPerMode(e.target.checked, version.version, mode) } 
                                inputProps={{ "aria-label": "controlled" }}
                                sx={{ padding: "1px" }}
                                key={ version.version }
                              />
                            );
                          })}
                        </div>
                      </div>

                      <Levels 
                        levels={ mode.level }
                        versions={ versions }
                        category={ category }
                        onVersionCheck={ onVersionCheck }
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <button type="submit" id={ styles.submit } className="center">
        <AddIcon />
        <span>Add New Version(s)</span>
      </button>
    </form>
  );
});

function Levels({ levels, versions, category, onVersionCheck }) {
  /* ===== LEVELS COMPONENT ===== */
  return (
    <table className={ styles.levels }>
      <thead>
        <tr>
          <th>Chart</th>
          <th></th>
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

  /* ===== VARIABLES ===== */
  const levelName = level.name;
  const categoryName = category.name;

  /* ===== FUNCTIONS ===== */
  const handleChange = (checked, newVersion) => {
    setVersion(newVersion === version ? undefined : newVersion);

    // This is a "hack" that improves performance - allows "frontend" focused state, that being `version`
    // to render BEFORE we attempt to update the larger, less performant "game" state
    setTimeout(() => {
      onVersionCheck(checked, newVersion, categoryName, levelName);
    }, [0]);
  };

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
        <FancyLevel level={ levelName } />
      </td>
      { versions.map(v => {
        const value = v.version;
        return (
          <td key={ value }>
            <Checkbox 
              checked={ value === version } 
              onChange={ (e) => handleChange(e.target.checked, value) } 
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