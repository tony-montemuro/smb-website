/* ===== IMPORTS ===== */
import DetailedUsername from "../../components/DetailedUsername/DetailedUsername";
import StylesHelper from "../../helper/StylesHelper.js";

function MedalTableRow({ row, index, imageReducer }) {
  /* ===== FUNCTIONS ===== */

  // helper functions
  const { indexToParity } = StylesHelper();

  /* ===== MEDAL TABLE ROW COMPONENT ===== */
  return (
    <tr className={ indexToParity(index) } key={ `${ row.profile.username }-row` }>
      <td>{ row.position }</td>
      <td>
        <DetailedUsername imageReducer={ imageReducer } profile={ row.profile } />
      </td>
      <td>{ row.platinum }</td>
      <td>{ row.gold }</td>
      <td>{ row.silver }</td>
      <td>{ row.bronze }</td>
    </tr>
  );
};

/* ===== EXPORTS ===== */
export default MedalTableRow;