/* ===== IMPORTS ====== */
import { Outlet, useParams } from "react-router-dom";

function GameLayout() {
  /* ===== VARIABLES ===== */
  const params = useParams();
  const { abb } = params;

  /* ===== GAME LAYOUT COMPONENT ===== */
  return (
    <>
      <h1>Game Layout!</h1>
      <Outlet />
    </>
  )
};

/* ===== EXPORTS ===== */
export default GameLayout;