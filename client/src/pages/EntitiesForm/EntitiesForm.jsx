/* ===== IMPORTS ===== */
import { useEffect, useState } from "react";
import styles from "./EntitiesForm.module.css";
import Container from "../../components/Container/Container.jsx";
import EntitiesFormLogic from "./EntitiesForm.js";
import EntityAddForm from "../../components/EntityAddForm/EntityAddForm.jsx";
import FrontendHelper from "../../helper/FrontendHelper.js";
import Popup from "../../components/Popup/Popup.jsx";
import SelectList from "../../components/SelectList/SelectList.jsx";

function EntitiesForm() {
  /* ===== STATES ===== */
  const [selectData, setSelectData] = useState(null);
  const [submittingEntity, setSubmittingEntity] = useState(false);

  /* ===== FUNCTIONS ===== */

  // sstates & functions from the js file
  const { 
    form, 
    addEntity, 
    populateForm, 
    fetchSelectData, 
    handleInsert, 
    handleUpdate,
    openPopup,
    closePopup
  } = EntitiesFormLogic(setSelectData);

  /* ===== EFFECTS ===== */

  // code that is executed when the component mounts
  useEffect(() => {
    populateForm();
    fetchSelectData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ===== ENTITIES FORM COMPONENT ===== */
  return selectData &&
    <Container title="Game Entities">
      <Popup 
				renderPopup={ addEntity } 
				setRenderPopup={ closePopup } 
				width="1000px"
				disableClose={ null }
			>
				<EntityAddForm 
          submitting={ submittingEntity } 
          setSubmitting={ setSubmittingEntity }
          refreshSelectDataFunc={ fetchSelectData }
        />
			</Popup>

      <div className={ styles.entitiesForm }>
        <span>
          <em>
            On this screen, you will select and define the <strong>entities</strong> for each game.&nbsp;
            <strong>Entities</strong> are items that have a <a href="https://en.wikipedia.org/wiki/Many-to-many_%28data_model%29" target="_blank" rel="noopener noreferrer">many-to-many relationship</a>
            &nbsp;with games, unrelated to game structure. <strong>The order you select each entity determines the order they will
            appear on the website!</strong>
          </em>
        </span>
        <div className={ styles.input }>
          <SelectList
            entities={ form.values.monkey }
            inputData={{
              id: "monkey",
              label: "Monkeys",
              handleChange: handleUpdate,
              handleInsert: handleInsert
            }}
            selectData={{ 
              entities: selectData.monkey,
              entityName: "monkey",
              entityNameAlt: "monkey_name"
            }}
          />
          <EntityAddLink entityName="monkey" openPopup={ openPopup } />
        </div>
        <div className={ styles.input }>
          <SelectList
            entities={ form.values.platform }
            inputData={{
              id: "platform",
              label: "Platforms",
              handleChange: handleUpdate,
              handleInsert: handleInsert
            }}
            selectData={{ 
              entities: selectData.platform,
              entityName: "platform",
              entityNameAlt: "platform_name"
            }}
          />
          <EntityAddLink entityName="platform" openPopup={ openPopup } />
        </div>
        <div className={ styles.input }>
          <SelectList
            entities={ form.values.region }
            inputData={{
              id: "region",
              label: "Regions",
              handleChange: handleUpdate,
              handleInsert: handleInsert
            }}
            selectData={{ 
              entities: selectData.region,
              entityName: "region",
              entityNameAlt: "region_name"
            }}
          />
          <EntityAddLink entityName="region" openPopup={ openPopup } />
        </div>
        <div className={ styles.input }>
          <SelectList
            entities={ form.values.rule }
            inputData={{
              id: "rule",
              label: "Rules",
              handleChange: handleUpdate,
              handleInsert: handleInsert
            }}
            selectData={{ 
              entities: selectData.rule,
              entityName: "rule",
              entityNameAlt: "rule_name"
            }}
          />
          <EntityAddLink entityName="rule" openPopup={ openPopup } />
        </div>
      </div>
    </Container>
};

function EntityAddLink({ entityName, openPopup }) {
  /* ===== FUNCTIONS ===== */

  // helper functions
  const { capitalize } = FrontendHelper();

  /* ===== ENTITY ADD LINK COMPONENT ===== */
  return (
    <span onClick={ openPopup } className="hyperlink">
      { capitalize(entityName) } missing from list? Click here to upload a new { entityName }!
    </span>
  )
};

/* ===== EXPORTS ===== */
export default EntitiesForm;