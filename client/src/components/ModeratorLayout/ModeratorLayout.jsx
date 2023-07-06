/* ===== IMPORTS ===== */
import "./ModeratorLayout.css";
import { Outlet } from "react-router-dom";
import ModeratorLogic from "./ModeratorLayout.js";

function ModeratorLayout() {
  /* ===== MODERATOR LAYOUT COMPONENT ===== */
  return (
    <div className="moderator-layout">
      <h1>Moderator Layout</h1>
      <Outlet />
    </div>
  );
};

/* ===== EXPORTS ===== */
export default ModeratorLayout;