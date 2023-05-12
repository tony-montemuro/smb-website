/* ===== IMPORTS ===== */
import "./DetailedUsername.css";
import Avatar from "../Avatar/Avatar.jsx";
import Username from "../Username/Username";

function DetailedUsername({ url, imageReducer, country, profileId, username }) {
  /* ===== VARIABLES ===== */
  const IMG_LENGTH = 60;

  /* ===== DETAILED USERNAME COMPONENT ===== */
  return (
    <div className="detailed-username">
      <Avatar url={ url } size={ IMG_LENGTH } imageReducer={ imageReducer } />
      <Username country={ country } profileId={ profileId } username={ username } />
    </div>
  );
};

/* ===== EXPORTS ===== */
export default DetailedUsername;