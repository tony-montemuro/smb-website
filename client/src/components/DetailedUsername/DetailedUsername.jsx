/* ===== IMPORTS ===== */
import styles from "./DetailedUsername.module.css";
import Avatar from "../Avatar/Avatar.jsx";
import Username from "../Username/Username";

function DetailedUsername({ imageReducer, profile, disableLink }) {
  /* ===== VARIABLES ===== */
  const IMG_LENGTH = 60;

  /* ===== DETAILED USERNAME COMPONENT ===== */
  return (
    <div className={ styles.detailedUsername }>
      <Avatar profileId={ profile.id } size={ IMG_LENGTH } imageReducer={ imageReducer } />
      <Username profile={ profile } disableLink={ disableLink } />
    </div>
  );
};

/* ===== EXPORTS ===== */
export default DetailedUsername;