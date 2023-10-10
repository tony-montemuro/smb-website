/* ===== IMPORTS ===== */
import DetailedUsername from "../../components/DetailedUsername/DetailedUsername";

function MedalTableRow({ row, imageReducer }) {
  /* ===== MEDAL TABLE ROW COMPONENT ===== */
  return (
    <tr key={ `${ row.profile.username }-row` }>
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