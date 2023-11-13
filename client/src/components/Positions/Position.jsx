function Position(position, id, submitted_at) {
  /* ===== POSITION COMPONENT ===== */
  return position ?
    dateB2F(id) === dateB2F(submitted_at) ? submission.position : (
        <span title="Date does not match the timestamp it was submitted at, so live position could not be calculated.">
          -
        </span>
      )
    : 
      <span title="Not a live submission.">-</span>;
};

/* ===== EXPORTS ===== */
export default Position;