/* ===== IMPORTS ===== */
import styles from "./ExpansionPanel.module.css";

function ExpansionPanel({ title, children }) {
  /* ===== EXPANSION PANEL COMPONENT ===== */
  return (
    <details className={ styles.expansionPanel }>
      <summary>
        <h3>{ title }</h3>
      </summary>
      <div className={ styles.content }>
        { children }
      </div>
    </details>
  );
};

/* ===== EXPORTS ===== */
export default ExpansionPanel;