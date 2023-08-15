/* ===== IMPORTS ===== */
import "./SearchBarInput.css";

function SearchBarInput({ itemType, searchRef, handleFilter, clearSearch }) {
  /* ===== SEARCH BAR INPUT COMPONENT ===== */
  return (
    <div className="searchbar-input">

      { /* Search bar text input: allows a user to type some text name, which will apply some filter when a change is detected. */ }
      <input 
        type="text"
        ref={ searchRef }
        placeholder={ `Search for ${ itemType }...` }
        onChange={ (e) => handleFilter(e.target.value) }
      />

      { /* Search bar icon: an icon, which is initially just for decoration, turns into a clickable icon when user enters any text. */ }
      <div className="searchbar-input-icon">
        { searchRef.current && searchRef.current.value.length > 0 ?
          <button type="button" className="searchbar-input-clear" onClick={ clearSearch }>❌</button> 
        :
          <>🔍</> 
        }
      </div>
    </div>
  );
};

/* ===== EXPORTS ===== */
export default SearchBarInput;