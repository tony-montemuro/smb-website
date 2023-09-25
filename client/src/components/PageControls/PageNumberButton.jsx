function PageNumberButton({ currentPageNum, pageNum, setPageNum }) {
  /* ===== PAGE NUMBER BUTTON COMPONENT ===== */
  return (
    <button 
      type="button" 
      onClick={ () => setPageNum(pageNum) }
      className={ `page-number-btn${ pageNum === currentPageNum ? " page-number-btn-selected" : "" }` }
    >
      { pageNum }
    </button>
  );
};

/* ===== EXPORTS ===== */
export default PageNumberButton;