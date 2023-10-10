/* ===== IMPORTS ===== */
import Loading from "../Loading/Loading.jsx";

function LoadingTable({ numCols }) {
  /* ===== LOADING TABLE COMPONENT ===== */
  return (
    <tr className="even">
      <td colSpan={ numCols }>
        <Loading />
      </td>
    </tr>
  )
};

/* ===== EXPORTS ===== */
export default LoadingTable;