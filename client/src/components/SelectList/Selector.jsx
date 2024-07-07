/* ===== IMPORTS ===== */
import styles from "./SelectList.module.css";
import TextField from "@mui/material/TextField";

function Selector({ inputData, selectData, inputValue, handleChange, id }) {
  /* ===== SELECTOR COMPONENT ===== */
  return (
    <div className={ styles.selector }>
      <TextField
        id={ `${ inputData.entityName }_${ id }` }
        onChange={ e => handleChange(e.target.value, id, inputData.entityName) }
        select
        SelectProps={ { native: true } }
        sx={ { width: "fit-content" } }
        value={ inputValue }
        variant="filled"
      >
        <option key="null" value=""></option>
        { selectData.entities.map(entity => (
          <option 
            key={ entity.id } 
            value={ entity[selectData.valueAttribute] } 
          >
            { selectData.entities.find(e => e.id === entity.id)[selectData.entityName] }
          </option>
        ))}
      </TextField>
      <button type="button" disabled={ !inputValue } onClick={ () => handleChange("", id, inputData.entityName) } >Delete</button>
    </div>
  );
};

/* ===== EXPORTS ===== */
export default Selector;