/* ===== IMPORTS ===== */
import styles from "./Sections.module.css";
import Sections from "./Sections.js";
import Username from "../../../components/Username/Username.jsx";

function Metadata({ metadata }) {
  /* ===== FUNCTIONS ===== */

  // functions from the js file
  const { renderBoolean } = Sections();

  /* ===== METADATA COMPONENT ===== */
  return (
    <div className={ styles.section }>
      <h2>Main Information</h2>
      <span>Name: { metadata.name }</span>
      <span>Abbreviation: { metadata.abb }</span>
      <span>Release Data: { metadata.release_date }</span>
      { metadata.custom &&
        <span>Minimum Data: { metadata.min_date }</span>
      }
      <span>Live Preference: { renderBoolean(metadata.live_preference) }</span>
      <span>Custom Game: { renderBoolean(metadata.custom) }</span>
      { metadata.custom &&
        <>
          <span>Download URL: { metadata.download }</span>
          <span>Creator:&nbsp;&nbsp;<Username profile={ metadata.creator } disableLink /></span>
        </>
      }
    </div>
  );
};

/* ===== EXPORTS ===== */
export default Metadata;