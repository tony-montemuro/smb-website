/* ===== IMPORTS ===== */
import "./UserLayout.css";
import { Outlet } from "react-router-dom";

function UserLayout() {
  /* ===== USER LAYOUT COMPONENT ===== */ 
  return (
    <div className="user-layout">
      <h1>User Layout!</h1>
      <Outlet />
    </div>
  );
};  

/* ===== EXPORTS ===== */
export default UserLayout;