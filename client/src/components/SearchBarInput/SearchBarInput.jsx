/* ===== IMPORTS ===== */
import styles from "./SearchBarInput.module.css";
import ClearRoundedIcon from "@mui/icons-material/ClearRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";

function SearchBarInput({ itemType, input, setInput }) {
  /* ===== SEARCH BAR INPUT COMPONENT ===== */
  return (
    <div className={ styles.searchbarInput }>

      { /* Search bar text input: allows a user to type some text name, which will apply some filter when a change is detected. */ }
      <input
        type="text"
        value={ input }
        placeholder={ `Search for ${ itemType }...` }
        className={ styles.input }
        onChange={ (e) => setInput(e.target.value) }
      />

      { /* Search bar icon: an icon, which is initially just for decoration, turns into a clickable icon when user enters any text. */ }
      <div className={ styles.icon }>
        { input.length > 0 ?
          <button type="button" className={ `${ styles.clear } center` } onClick={ () => setInput("") }>
            <ClearRoundedIcon />
          </button> 
        :
          <SearchRoundedIcon sx={ { opacity: 0.85 } } />
        }
      </div>

    </div>
  );
};

/* ===== EXPORTS ===== */
export default SearchBarInput;