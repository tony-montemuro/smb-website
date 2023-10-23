/* ===== IMPORTS ====== */
import { useLocation } from "react-router-dom";
import styles from "./Stats.module.css";
import FrontendHelper from "../../../helper/FrontendHelper";

function Total({ total, filter }) {
  /* ===== VARIABLES ====== */
  const location = useLocation();
  const path = location.pathname.split("/");
  const type = path[5];

  /* ===== FUNCTIONS ===== */
  const { capitalize, secondsToHours } = FrontendHelper();
  
  /* ===== TOTAL COMPONENT ===== */
  return (
    <div className={ styles.stats }>
      <h2>{ capitalize(type) } Total</h2>
      { total ?
        <div className="table">
          <table className={ styles.slim }>

            { /* Table header - shows what information is rendered in each cell */ }
            <thead>
              <tr>
                <th>Position</th>
                <th>{ capitalize(type) } Total</th>
              </tr>
            </thead>

            { /* Table body - Render the information itself */ }
            <tbody>
              <tr>
                <td>{ total.position }</td>
                <td>{ secondsToHours(total.total, type) }</td>
              </tr>
            </tbody>

          </table>
        </div>
      :
        filter === "live" ?
          // If the filter is set to live, render this message.
          <span><i>This user has not submitted any live records to this category.</i></span>
        :
          // Otherwise, render this message.
          <span><i>This user has not submitted to this category.</i></span>
      }
    </div>
  );
};

/* ===== EXPORTS ====== */
export default Total;