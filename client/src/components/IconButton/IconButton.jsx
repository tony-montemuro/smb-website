/* ===== IMPORTS ===== */
import styles from "./IconButton.module.css";

function IconButton({ name, onClick, children }) {
  /* ===== ICON BUTTON COMPONENT ===== */
  return (
    <button type="button" className={ styles.iconButton } onClick={ onClick }>
      <div className={ styles.inner }>{ children }&nbsp;{ name }</div>
    </button>
  );
};

/* ===== EXPORTS ===== */
export default IconButton;