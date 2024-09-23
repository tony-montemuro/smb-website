/* ===== IMPORTS ===== */
import { Fragment } from "react";
import Errorable from "./Errorable.jsx";
import styles from "./Sections.module.css";
import SectionsLogic from "./Sections.js";
import Username from "../../../components/Username/Username.jsx";

function GameEntities({ entities, error }) {
  /* ===== FUNCTIONS ===== */

  // functions from the js file
  const { stringifyEntities } = SectionsLogic();

  /* ===== GAME ENTITIES COMPONENT ===== */
  return (
    <div className={ styles.section }>
      <h2>Game Entities</h2>
      <hr />

      <div className={ styles.sectionContent }>
        <Errorable error={ error?.monkey } renderMessage>
          <span>Monkeys: { stringifyEntities(entities.monkey) }</span>
        </Errorable>
        <Errorable error={ error?.platform } renderMessage>
          <span>Platforms: { stringifyEntities(entities.platform) }</span>
        </Errorable>
        <Errorable error={ error?.region } renderMessage>
          <span>Regions: { stringifyEntities(entities.region) }</span>
        </Errorable>
        <Errorable error={ error?.rule } renderMessage>
          <span>
            Rules:
            <ol>
              { entities.rule.map(rule => {
                return <li key={ rule.id }>{ rule.name }</li>;
              }) }
            </ol>
          </span>
        </Errorable>
        <span>
          Moderators:&nbsp;
          { entities.moderator.length > 0 ? 
            entities.moderator.map((moderator, index) => {
              return (
                <Fragment key={ moderator.id }>
                  <span>
                    <Username profile={ moderator } disableLink />
                    { index < entities.moderator.length-1 ? "," : null }
                  </span>
                  { index < entities.moderator.length-1 ? " " : null }
                </Fragment>
              );
            }) 
          :
            <em>none</em> 
          }
        </span>

      </div>

    </div>
  );
};

/* ===== EXPORTS ===== */
export default GameEntities;