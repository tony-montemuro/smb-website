function TableContent({ items, emptyMessage, numCols, children }) {
  /* ===== TABLE CONTENT COMPONENT ===== */
  return items.length > 0 ? 
    children
  : 
    <tr>
      <td style={ { textAlign: "center" } } colSpan={ numCols }>
        <em>{ emptyMessage }</em>
      </td>
    </tr>;
};

/* ===== EXPORTS ===== */
export default TableContent;