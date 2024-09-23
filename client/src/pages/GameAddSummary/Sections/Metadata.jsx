/* ===== IMPORTS ===== */
import styles from "./Sections.module.css";
import Errorable from "./Errorable.jsx";
import Sections from "./Sections.js";
import Username from "../../../components/Username/Username.jsx";

function Metadata({ metadata, error }) {
  /* ===== FUNCTIONS ===== */

  // functions from the js file
  const { renderBoolean } = Sections();

  /* ===== METADATA COMPONENT ===== */
  return (
    <div className={ styles.section }>
      <h2>Main Information</h2>
      <hr />

      <div className={ styles.sectionContent }>
        <span>Name: { metadata.name }</span>
        <Errorable error={ error?.abb } renderMessage>
          <span>Abbreviation: { metadata.abb }</span>
        </Errorable>
        <Errorable error={ error?.release_date } renderMessage>
          <span>Release Data: { metadata.release_date }</span>
        </Errorable>
        
        { metadata.custom &&
          <Errorable error={ error?.min_date } renderMessage>
            <span>Minimum Data: { metadata.min_date }</span>
          </Errorable>
        }

        <span>Live Preference: { renderBoolean(metadata.live_preference) }</span>
        <span>Custom Game: { renderBoolean(metadata.custom) }</span>

        { metadata.custom &&
          <>
            <span id={ styles.download }>
              Download URL: <a href={ metadata.download } target="_blank" rel="noreferrer">{ metadata.download }</a>
            </span>
            <span>Creator:&nbsp;&nbsp;<Username profile={ metadata.creator } disableLink /></span>
          </>
        }
      </div>
    </div>
  );
};

/* ===== EXPORTS ===== */
export default Metadata;