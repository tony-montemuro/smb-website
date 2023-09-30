function UpdatedFieldSymbol({ oldVal, newVal }) {
  /* ===== UPDATED FIELD SYMBOL ===== */
  return newVal !== oldVal && <span title="This field has been updated.">*</span>
};

/* ===== EXPORTS ===== */
export default UpdatedFieldSymbol;