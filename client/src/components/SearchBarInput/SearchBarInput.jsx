/* ===== IMPORTS ===== */
import "./SearchBarInput.css";

function SearchBarInput({ itemType, input, setInput, width = null }) {
  /* ===== VARIABLES ===== */
  const theme = (width && width !== "100%") ? { width: width } : {};

  /* ===== SEARCH BAR INPUT COMPONENT ===== */
  return (
    <div className="searchbar-input" style={ theme }>

      { /* Search bar text input: allows a user to type some text name, which will apply some filter when a change is detected. */ }
      <input 
        type="text"
        value={ input }
        placeholder={ `Search for ${ itemType }...` }
        className="searchbar-input-field"
        onChange={ (e) => setInput(e.target.value) }
      />

      { /* Search bar icon: an icon, which is initially just for decoration, turns into a clickable icon when user enters any text. */ }
      <div className="searchbar-input-icon">
        { input.length > 0 ?
          <button type="button" className="searchbar-input-clear" onClick={ () => setInput("") }>❌</button> 
        :
          <>🔍</> 
        }
      </div>
    </div>
  );
};

/* ===== EXPORTS ===== */
export default SearchBarInput;