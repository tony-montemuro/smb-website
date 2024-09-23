/* ===== IMPORTS ===== */
import { useLocation } from "react-router-dom";
import styles from "./Totalizer.module.css";
import DetailedUsername from "../../components/DetailedUsername/DetailedUsername.jsx";
import FrontendHelper from "../../helper/FrontendHelper.js";

function TotalizerRow({ row, topTotal, imageReducer, decimalPlaces }) {
  /* ===== FUNCTIONS ===== */

  // helper functions
  const { secondsToHours } = FrontendHelper();
  
  /* ===== VARIABLES ===== */
  const location = useLocation();
  const type = location.pathname.split("/")[5];
  const difference = type === "score" ? topTotal-row.total : row.total-topTotal;
  const totalDifference = secondsToHours(difference, type, decimalPlaces);

  /* ===== TOTALIZER ROW COMPONENT ===== */
  return (
    <tr>
      <td>{ row.position }</td>
      <td>
        <DetailedUsername imageReducer={ imageReducer } profile={ row.profile } />
      </td>
      <td>
        <div className={ styles.total }>
          { secondsToHours(row.total, type, decimalPlaces) }
          { row.position !== 1 && 
            <span 
              className={ styles.difference }
              title={ `${ totalDifference } ${ type === "score" ? "points" : "hours" } off first place` }
            >
              -{ totalDifference }
            </span> 
          }
        </div>
      </td>
    </tr>  
  );
};

/* ===== EXPORTS ===== */
export default TotalizerRow;