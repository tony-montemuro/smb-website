function NotificationProof({ proof }) {
  /* ===== NOTIFICATION PROOF COMPONENT ===== */
  // this component will only render if proof exists
  return proof ?
    <a href={ proof } target="_blank" rel="noopener noreferrer">Link</a>
  :
    <i>None</i>
};

/* ===== EXPORTS ===== */
export default NotificationProof;