/* ===== IMPORTS ===== */
import { useLocation } from "react-router-dom";
import styles from "./Stats.module.css";
import FrontendHelper from "../../../helper/FrontendHelper";

function Medals({ medals, filter }) {
  /* ===== VARIABLES ====== */
  const location = useLocation();
  const type = location.pathname.split("/")[5];

  /* ===== FUNCTIONS ===== */
  const { capitalize } = FrontendHelper();

  /* ===== MEDALS COMPONENT ===== */
  return (
    <div className={ styles.stats }>
      <h2>{ capitalize(type) } Medals</h2>
      <span><em><strong>Note:</strong> Medals counts are computed using live records only!</em></span>

      { medals ?
        <div className="table">
          <table className={ styles.slim }>

            { /* Table header - shows what information is rendered in each cell */ }
            <thead>
              <tr>
                <th>Position</th>
                <th>Platinum</th>
                <th>Gold</th>
                <th>Silver</th>
                <th>Bronze</th>
              </tr>
            </thead>

            { /* Table body - Render the information itself */ }
            <tbody>
              <tr>
                <td>{ medals.position }</td>
                <td>{ medals.platinum }</td>
                <td>{ medals.gold }</td>
                <td>{ medals.silver }</td>
                <td>{ medals.bronze }</td>
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

/* ===== EXPORTS ===== */
export default Medals;