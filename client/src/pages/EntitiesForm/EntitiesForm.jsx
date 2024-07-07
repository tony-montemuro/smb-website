/* ===== IMPORTS ===== */
import { useEffect, useState } from "react";
import styles from "./EntitiesForm.module.css";
import Container from "../../components/Container/Container.jsx";
import EntitiesFormLogic from "./EntitiesForm.js";
import EntityAddForm from "../../components/EntityAddForm/EntityAddForm.jsx";
import FrontendHelper from "../../helper/FrontendHelper.js";
import Popup from "../../components/Popup/Popup.jsx";
import SelectList from "../../components/SelectList/SelectList.jsx";
import Username from "../../components/Username/Username.jsx";
import UserSearch from "../../components/UserSearch/UserSearch.jsx";

function EntitiesForm() {
  /* ===== STATES ===== */
  const [selectData, setSelectData] = useState(null);
  const [submittingEntity, setSubmittingEntity] = useState(false);

  /* ===== FUNCTIONS ===== */

  // states & functions from the js file
  const { 
    form, 
    addEntity, 
    populateForm, 
    fetchSelectData, 
    handleInsert, 
    handleUpdate,
    handleModeratorInsert,
    handleModeratorDelete,
    openPopup,
    closePopup,
    validateAndUpdate
  } = EntitiesFormLogic(setSelectData);

  /* ===== VARIABLES ===== */
  const USERS_PER_PAGE = 10;
  const userRowOptions = {
    isDetailed: false,
    disableLink: true,
    onUserRowClick: handleModeratorInsert
  };

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

      <form className={ styles.entitiesForm } onSubmit={ validateAndUpdate }>
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
              entityName: "monkey",
              label: "Monkeys",
              handleChange: handleUpdate,
              handleInsert: handleInsert,
              error: form.error.monkey,
              valueAttribute: "monkey"
            }}
            selectData={{ 
              entities: selectData.monkey,
              valueAttribute: "id",
              entityName: "monkey_name"
            }}
          />
          <EntityAddLink entityName="monkey" openPopup={ openPopup } />
        </div>

        <div className={ styles.input }>
          <SelectList
            entities={ form.values.platform }
            inputData={{
              entityName: "platform",
              label: "Platforms",
              handleChange: handleUpdate,
              handleInsert: handleInsert,
              error: form.error.platform,
              valueAttribute: "platform"
            }}
            selectData={{ 
              entities: selectData.platform,
              valueAttribute: "id",
              entityName: "platform_name"
            }}
          />
          <EntityAddLink entityName="platform" openPopup={ openPopup } />
        </div>

        <div className={ styles.input }>
          <SelectList
            entities={ form.values.region }
            inputData={{
              entityName: "region",
              label: "Regions",
              handleChange: handleUpdate,
              handleInsert: handleInsert,
              error: form.error.region,
              valueAttribute: "region"
            }}
            selectData={{ 
              entities: selectData.region,
              valueAttribute: "id",
              entityName: "region_name"
            }}
          />
          <EntityAddLink entityName="region" openPopup={ openPopup } />
        </div>

        <div className={ styles.input }>
          <SelectList
            entities={ form.values.rule }
            inputData={{
              entityName: "rule",
              label: "Rules",
              handleChange: handleUpdate,
              handleInsert: handleInsert,
              error: form.error.rule,
              valueAttribute: "rule"
            }}
            selectData={{ 
              entities: selectData.rule,
              valueAttribute: "id",
              entityName: "rule_name"
            }}
          />
          <EntityAddLink entityName="rule" openPopup={ openPopup } />
        </div>

        <div className={ styles.input }>
          <h3>Moderators</h3>
          <span>Select moderators via user search.</span>
          <div className={ styles.moderatorList }>
            { form.values.moderator.map((moderator, index) => {
              return (
                <div className={ `${ styles.moderator } ${ (index+1) % 2 ? "even" : "odd" }` } key={ moderator.id }>
                  <Username profile={ moderator } disableLink />
                  <button type="button" onClick={ () => handleModeratorDelete(moderator.id) }>Delete</button>
                </div>
              );
            })}
          </div>
          <UserSearch usersPerPage={ USERS_PER_PAGE } userRowOptions={ userRowOptions } />
        </div>

        <button type="submit">Validate</button>
      </form>
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