/* ===== IMPORTS ===== */
import "./DetailedUsername.css";
import Avatar from "../Avatar/Avatar.jsx";
import Username from "../Username/Username";

function DetailedUsername({ imageReducer, profile }) {
  /* ===== VARIABLES ===== */
  const IMG_LENGTH = 60;

  /* ===== DETAILED USERNAME COMPONENT ===== */
  return (
    <div className="detailed-username">
      <Avatar profileId={ profile.id } size={ IMG_LENGTH } imageReducer={ imageReducer } />
      <Username profile={ profile } />
    </div>
  );
};

/* ===== EXPORTS ===== */
export default DetailedUsername;