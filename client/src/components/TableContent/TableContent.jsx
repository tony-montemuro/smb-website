function TableContent({ items, emptyMessage, numCols, children }) {
  /* ===== TABLE CONTENT COMPONENT ===== */
  return items.length > 0 ? children : <tr><td colSpan={ numCols }>{ emptyMessage }</td></tr>;
};

/* ===== EXPORTS ===== */
export default TableContent;