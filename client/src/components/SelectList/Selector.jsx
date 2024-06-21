/* ===== IMPORTS ===== */
import styles from "./SelectList.module.css";
import TextField from "@mui/material/TextField";

function Selector({ inputData, selectData, value, handleChange, id }) {
  return (
    <div className={ styles.selector }>
      <TextField
        id={ `${ inputData.id }_${ id }` }
        onChange={ e => handleChange(e, id, selectData.entityName) }
        placeholder={ selectData.entityName }
        select
        SelectProps={ { native: true } }
        value={ value }
        variant="filled"
      >
        <option key="null" value=""></option>
        { selectData.entities.map(entity => (
          <option 
            key={ entity.id } 
            value={ entity.id } 
          >
            { selectData.entities.find(e => e.id === entity.id)[selectData.entityNameAlt] }
          </option>
        ))}
      </TextField>
      <button type="button" disabled={ !value }>Delete</button>
    </div>
  );
};

/* ===== EXPORTS ===== */
export default Selector;