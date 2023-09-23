/* ===== IMPORTS ===== */
import "./ModeratorTabs.css";
import ModeratorTab from "./ModeratorTab.jsx";

function ModeratorTabs({ tabs }) {
  /* ===== MODERATOR TABS COMPONENT ===== */
  return (
    <div className="moderator-tabs">
      { tabs.map(tab => {
        return <ModeratorTab tab={ tab } key={ JSON.stringify(tab) } />
      })}
    </div>
  );
};

/* ===== EXPORTS ===== */
export default ModeratorTabs;