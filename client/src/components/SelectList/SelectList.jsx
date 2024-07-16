/* ===== IMPORTS ===== */
import styles from "./SelectList.module.css";
import FormHelperText from "@mui/material/FormHelperText";
import Selector from "./Selector.jsx";

function SelectList({ entities, inputData, selectData, children }) {
  /* ===== VARIABLES ===== */
  const emptyEntity = {
    id: entities.length > 0 ? entities.at(-1).id+1 : 1,
    [inputData.entityName]: ""
  };

  /* ===== SELECT LIST COMPONENT ===== */
  return (
    <div className={ styles.selectList }>
      <h3>{ inputData.label }</h3>
      { entities.map(entity => {
        return (
          <Selector
            inputData={ inputData } 
            selectData={ selectData }
            entity={ entity }
            handleChange={ inputData.handleChange }
            key={ JSON.stringify(entity) } 
          >
            { children }
          </Selector>
        );
      })}
      <Selector
        inputData={ inputData }
        selectData={ selectData }
        entity={ emptyEntity }
        handleChange={ inputData.handleInsert }
      />
      { inputData.error && <FormHelperText className={ styles.error } error>{ inputData.error }</FormHelperText> }
    </div>
  );
};

/* ===== EXPORTS ===== */
export default SelectList;