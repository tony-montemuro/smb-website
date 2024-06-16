/* ===== IMPORTS ===== */
import styles from "./SelectList.module.css";
import TextField from "@mui/material/TextField";

function Selector({ inputData, selectData, entity }) {
  return (
    <div className={ styles.selector }>
      <TextField
        id={ inputData.id }
        label={ inputData.label }
        select
        SelectProps={{ native: true }}
        onChange={ inputData.handleChange }
        value={ entity[selectData.entityName] }
        variant="filled"
      >
        { selectData.entities.map(entity => (
          <option 
            value={ entity.id } 
            key={ entity.id } 
          >
            { entity[selectData.entityNameAlt] }
          </option>
        ))}
      </TextField>
      <button type="button">Delete</button>
    </div>
  );
};

/* ===== EXPORTS ===== */
export default Selector;