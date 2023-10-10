/* ===== IMPORTS ===== */
import { useLocation } from "react-router-dom";
import DetailedUsername from "../../components/DetailedUsername/DetailedUsername.jsx";
import FrontendHelper from "../../helper/FrontendHelper.js";

function TotalizerRow({ row, imageReducer }) {
  /* ===== VARIABLES ===== */
  const location = useLocation();
  const type = location.pathname.split("/")[5];

  /* ===== FUNCTIONS ===== */

  // helper functions
  const { secondsToHours } = FrontendHelper();

  /* ===== TOTALIZER ROW COMPONENT ===== */
  return (
    <tr>
      <td>{ row.position }</td>
      <td>
        <DetailedUsername imageReducer={ imageReducer } profile={ row.profile } />
      </td>
      <td>{ secondsToHours(row.total, type) }</td>
    </tr>  
  );
};

/* ===== EXPORTS ===== */
export default TotalizerRow;