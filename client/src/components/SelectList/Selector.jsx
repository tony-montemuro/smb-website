/* ===== IMPORTS ===== */
import styles from "./SelectList.module.css";
import TextField from "@mui/material/TextField";

function Selector({ inputData, selectData, entity, index }) {
  return (
    <div className={ styles.selector }>
      <TextField
        id={ `${ inputData.id }_${ index }` }
        select
        SelectProps={ { native: true } }
        onChange={ inputData.handleChange }
        value={ entity[selectData.entityName] }
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
      <button type="button">Delete</button>
    </div>
  );
};

/* ===== EXPORTS ===== */
export default Selector;