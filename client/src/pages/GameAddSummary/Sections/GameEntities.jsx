/* ===== IMPORTS ===== */
import { Fragment } from "react";
import styles from "./Sections.module.css";
import SectionsLogic from "./Sections.js";
import Username from "../../../components/Username/Username.jsx";

function GameEntities({ entities }) {
  /* ===== FUNCTIONS ===== */

  // functions from the js file
  const { stringifyEntities } = SectionsLogic();

  /* ===== GAME ENTITIES COMPONENT ===== */
  return (
    <div className={ styles.section }>
      <h2>Game Entities</h2>
      <hr />

      <div className={ styles.sectionContent }>
        <span>Monkeys: { stringifyEntities(entities.monkey) }</span>
        <span>Platforms: { stringifyEntities(entities.platform) }</span>
        <span>Regions: { stringifyEntities(entities.region) }</span>

        <span>Rules:</span>
        <ol>
          { entities.rule.map(rule => {
            return <li key={ rule.id }>{ rule.name }</li>;
          }) }
        </ol>

        <span>
          Moderators:&nbsp;
          { entities.moderator.map((moderator, index) => {
            return (
              <Fragment key={ moderator.id }>
                <span>
                  <Username profile={ moderator } disableLink />
                  { index < entities.moderator.length-1 ? "," : null }
                </span>
                { index < entities.moderator.length-1 ? " " : null }
              </Fragment>
            );
          })}
        </span>
      </div>

    </div>
  );
};

/* ===== EXPORTS ===== */
export default GameEntities;