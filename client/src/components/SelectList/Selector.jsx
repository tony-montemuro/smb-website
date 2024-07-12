/* ===== IMPORTS ===== */
import { cloneElement } from "react";
import styles from "./SelectList.module.css";
import FrontendHelper from "../../helper/FrontendHelper";
import TextField from "@mui/material/TextField";

function Selector({ inputData, selectData, inputValue, handleChange, id, children }) {
  /* ===== SELECTOR COMPONENT ===== */
  return (
    <div>
      <div className={ styles.selector }>
        <TextField
          id={ `${ inputData.entityName }${ inputValue }` }
          onChange={ e => handleChange(e.target.value, id, inputData.entityName) }
          select
          SelectProps={ { native: true } }
          sx={ { width: "fit-content" } }
          value={ inputValue }
          variant="filled"
        >
          <option key="null" value=""></option>
          <Options
            entities={ selectData.entities } 
            name={ selectData.entityName } 
            value={ selectData.valueAttribute } 
          />
        </TextField>
        <button type="button" disabled={ !inputValue } onClick={ () => handleChange("", id, inputData.entityName) } >Delete</button>
      </div>
      { inputValue && cloneElement(children, { [inputData.entityName]: inputValue, id: id }) }
    </div>
  );
};

function Options({ entities, name, value }) {
  /* ===== FUNCTIONS ===== */

  // helper functions
  const { snakeToTitleWithDashes } = FrontendHelper();

  /* ===== OPTIONS COMPONENT ===== */
  // if we simply have an array of entities, render an option for each
  if (Array.isArray(entities)) {
    return entities.map(entity => (
      <option 
        key={ entity.id } 
        value={ entity[value] } 
      >
        { entities.find(e => e.id === entity.id)[name] }
      </option>
    ));
  } 
  
  // otherwise, we have an object containing key-value compares of groups => entities, so handle that
  else {
    return Object.keys(entities).map(key => {
      return (
        <optgroup label={ snakeToTitleWithDashes(key) } key={ key }>
          { entities[key].map(entity => (
            <option 
              key={ entity.id } 
              value={ entity[value] } 
            >
              { entities[key].find(e => e.id === entity.id)[name] }
            </option>
          ))}
        </optgroup>
      );
    });
  }
};

/* ===== EXPORTS ===== */
export default Selector;