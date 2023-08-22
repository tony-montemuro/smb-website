/* ===== IMPORTS ===== */
import { Outlet } from "react-router-dom";

function ResourcesLayout() {
  /* ===== RESOURCES LAYOUT COMPONENT ===== */
  return (
    <div className="resources-layout">
      <h1>Resources Layout</h1>
      <Outlet />
    </div>
  );
};

/* ===== EXPORTS ===== */
export default ResourcesLayout;