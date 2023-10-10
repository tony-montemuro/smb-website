function TableContent({ items, emptyMessage, numRows, children }) {
  /* ===== TABLE CONTENT COMPONENT ===== */
  return items.length > 0 ? children : <tr><td rowSpan={ numRows } style={ { textAlign: "center" } }>{ emptyMessage }</td></tr>;
};

/* ===== EXPORTS ===== */
export default TableContent;