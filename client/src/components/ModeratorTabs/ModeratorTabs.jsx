/* ===== IMPORTS ===== */
import styles from "./ModeratorTabs.module.css";
import ModeratorTab from "./ModeratorTab.jsx";

function ModeratorTabs({ tabs }) {
  /* ===== MODERATOR TABS COMPONENT ===== */
  return (
    <div className={ styles.tabs }>
      { tabs.map(tab => {
        return <ModeratorTab tab={ tab } key={ JSON.stringify(tab) } />
      })}
    </div>
  );
};

/* ===== EXPORTS ===== */
export default ModeratorTabs;