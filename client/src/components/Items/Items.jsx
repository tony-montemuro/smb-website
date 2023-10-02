function Items({ items, emptyMessage, children }) {
  /* ===== ITEMS COMPONENT ===== */
  return items.length > 0 ? children : <p><i>{ emptyMessage }</i></p>;
};

/* ===== EXPORTS ===== */
export default Items;