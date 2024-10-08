/* ===== IMPORTS ===== */
import { cloneElement } from "react";
import styles from "./SelectList.module.css";
import DeleteIcon from "@mui/icons-material/Delete";
import FrontendHelper from "../../helper/FrontendHelper";
import TextField from "@mui/material/TextField";

function Selector({ inputData, selectData, entity, handleChange, colorBackgrounds, children }) {
  /* ===== VARIABLES ===== */
  const inputValue = entity[inputData.entityName];
  const id = entity.id;
  const opacity = 0.4;
  const backgroundColors = [
    `rgba(249, 64, 64, ${ opacity })`,
    `rgba(250, 149, 33, ${ opacity })`,
    `rgba(245, 136, 220, ${ opacity })`,
    `rgba(85, 222, 242, ${ opacity })`,
  ];

  /* ===== SELECTOR COMPONENT ===== */
  return (
    <div 
      className={ colorBackgrounds ? `${ styles.coloredSelector } ${ styles.container }` : "" } 
      style={ { backgroundColor: colorBackgrounds ? backgroundColors[id % backgroundColors.length] : null } 
    }>
      <div className={ styles.selector }>
        <TextField
          id={ `${ inputData.entityName }${ inputValue }` }
          onChange={ e => handleChange(e.target.value, id, inputData.entityName, e.target) }
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
        <button
          type="button"
          title={ `Delete ${ inputData.entityName }` }
          className="center"
          disabled={ !inputValue }
          onClick={ () => handleChange("", id, inputData.entityName) }
        >
          <DeleteIcon />
        </button>
      </div>

      { inputValue && children && cloneElement(children, { [inputData.entityName]: entity }) }
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
        { entity[name] }
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