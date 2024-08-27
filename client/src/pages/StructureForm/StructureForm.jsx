/* ===== IMPORTS ===== */
import { AppDataContext } from "../../utils/Contexts.js";
import { useContext, useEffect, useState } from "react";
import styles from "./StructureForm.module.css";
import GoalAddForm from "../../components/GoalAddForm/GoalAddForm.jsx";
import CategoryAddForm from "../../components/CategoryAddForm/CategoryAddForm.jsx";
import Container from "../../components/Container/Container.jsx";
import LevelList from "./LevelList/LevelList.jsx";
import Loading from "../../components/Loading/Loading.jsx";
import ModeList from "./ModeList/ModeList.jsx";
import Popup from "../../components/Popup/Popup.jsx";
import SelectList from "../../components/SelectList/SelectList.jsx";
import StructureFormLogic from "./StructureForm.js";

function StructureForm() {
  /* ===== VARIABLES ===== */
  const ADD_POPUP_WIDTH = "500px";

  /* ===== STATES & FUNCTIONS ===== */
  const [isComponentMounted, setIsComponentMounted] = useState(false);
  const [formData, setFormData] = useState(undefined);
  const [submitting, setSubmitting] = useState(false);

  // states & functions from the js file
  const { 
    form,
    popup,
    updateLocal,
    populateForm,
    queryFormData,
    updateFormCategories,
    handleCategoryInsert,
    handleCategoryUpdate,
    handleModeInsert,
    handleModeUpdate,
    handleModeDelete,
    handleLevelInsert,
    handleLevelChange,
    handleLevelDelete,
    validateStructure,
    openCategoryPopup,
    closeCategoryPopup,
    openGoalPopup,
    closeGoalPopup
  } = StructureFormLogic(formData, setFormData);

  /* ===== CONTEXTS ===== */

  // appData state from app data context
  const { appData } = useContext(AppDataContext);

  /* ===== EFFECTS ===== */

  // code that is executed when the component mounts
  useEffect(() => {
    populateForm();
    queryFormData();
    setIsComponentMounted(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // code that is executed when the categories state updates after the component has already mounted
  useEffect(() => {
    if (isComponentMounted) {
      updateFormCategories();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appData.categories]);

  /* ===== STRUCTURE FORM COMPONENT ===== */
  return (
    <Container title="Game Structure">

      { /* Popups */ }

      { /* Add Category Popup */ }
      <Popup 
				renderPopup={ popup.addCategory } 
				setRenderPopup={ closeCategoryPopup } 
				width={ ADD_POPUP_WIDTH }
				disableClose={ submitting }
			>
				<CategoryAddForm 
          submitting={ submitting } 
          setSubmitting={ setSubmitting }
        />
			</Popup>

      { /* Add Goal Popup */ }
      <Popup 
				renderPopup={ popup.addGoal }
				setRenderPopup={ closeGoalPopup }
        width={ ADD_POPUP_WIDTH }
			>
				<GoalAddForm
          submitting={ submitting }
          setSubmitting={ setSubmitting }
        />
			</Popup>

      { /* Structure form */ }
      <form className={ styles.structureForm } onSubmit={ validateStructure }>
        <span>
          On this screen, you will create and organize high score / fast time charts.
          It is important you understand how charts are organized:
        </span>
        <ul>
          <li>
            <strong>Game:</strong> All charts entered on this screen belong to the new <strong>game</strong> you are adding.
          </li>
          <li>
            <strong>Categories:</strong> Zooming into a game, a category is the <strong>next largest grouping </strong>
            of charts. All charts within the same category are <strong>ranked together.</strong> Categories has two different 
            styles:
            <ol>
              <li>
                <strong>"Practice Mode" Style</strong> - This is a traditional grouping of charts, that the average user is most familiar with.
                Submissions to charts within categories of this style are <strong>ranked by all 3 types:</strong> world records, totalizer, 
                and medal table. High scores / fast time charts are <strong>restricted to descending order</strong>, meaning the higher the high 
                score / fast time, the better. Some example "Practice Mode" style categories include Practice Mode, Miscellaneous
                Practice Mode, Practice Mode (Jumps), & Supernova. <strong>Traditional IL charts should be within this style of category.</strong>
              </li>
              <li>
                <strong>"Non-Practice Mode" Style</strong> - This is a less common grouping of charts, that some users of the website may be familiar
                with. Submissions to charts within categories of this style are <strong>only ranked by world records.</strong> However, high score /
                fast time charts can have <strong>either ascending or descending order.</strong> Some example "Non-Practice Mode" style categories
                include Challenge Mode, Party Games, & Time Attack. <strong>Non-traditional IL charts will typically be within this style
                of category.</strong>
              </li>
            </ol>
            Categories are <strong>somewhat arbitrary, and can be difficult to get right.</strong> If you have any questions about how to divide your
            new game into categories, please contact TonySMB!
          </li>
          <li>
            <strong>Modes:</strong> Within each category, charts are further sub-divided into modes. Modes typically reflect how&nbsp;
            <strong>charts are divided within the game</strong>, such as worlds or challenge modes. These should be <strong>familiar</strong> to 
            the user. This is the smallest level of division of charts.
          </li>
        </ul>
        <span>You should also be familiar with each chart field:</span>
        <ul>
          <li>
            <strong>Name:</strong> The name of the chart. This is a "smart" input, meaning it will take your text input, and perform two conversions:
            <ol>
              <li><strong>Backend Conversion:</strong> A version of the name that is friendly with the database.</li>
              <li><strong>Frontend Conversion:</strong> A version of the name that is friendly to the user. This includes auto-capitalization.</li>
            </ol>
            Feel free to type in all lowercase; the input should handle capitalization! A couple things to note: occasionally, modifying this input
            causes unexpected behavior with the cursor due to the conversions. If this issue is commonly reported, I will attempt to fix it in the future.
            Also, at this time, there is no way to force a word to start with a lowercase letter.
          </li>
          <li>
            <strong>Goal:</strong> The goal color of the chart. This field should only be set when the chart is <strong>limited to a single goal!</strong>
            &nbsp;Otherwise, leave this field empty.
          </li>
          <li>
            <strong>Chart Type:</strong> Specifies whether the chart should be <strong>score, time, or both!</strong> In the future, there may
            be more chart types added. Any chart outside this scope unfortunately cannot be added at this time.
          </li>
          <li>
            <strong>Timer Type: </strong> Specifies the <strong>format times should be stored and rendered</strong> for the chart. Unlike other fields, there is
            currently no way to add timer types. Contact <strong>TonySMB</strong> if you would like a new timer type added!
          </li>
        </ul>
        
        { /* Only render inputs if user has selected  */ }
        { formData ?
          <div style={ { width: "100%" } } className={ styles.structureForm }>
            <SelectList
              entities={ form.values.category }
              inputData={{
                entityName: "category",
                label: "Categories",
                handleChange: handleCategoryUpdate,
                handleInsert: handleCategoryInsert,
                error: form.error.category
              }}
              selectData={{ 
                entities: {
                  "practice_mode_style": formData.categories.filter(category => category.practice),
                  "non-practice_mode_style": formData.categories.filter(category => !category.practice)
                },
                valueAttribute: "abb",
                entityName: "name",
              }}
              colorBackgrounds
            >
              <ModeList 
                modes={ form.values.mode }
                handleBlur={ updateLocal }
                handleInsert={ handleModeInsert }
                handleChange={ handleModeUpdate }
                handleDelete={ handleModeDelete }
                errors={ form.error.mode }
              >
                <LevelList 
                  levels={ form.values.level }
                  handleBlur={ updateLocal }
                  handleInsert={ handleLevelInsert }
                  handleChange={ handleLevelChange }
                  handleDelete={ handleLevelDelete }
                  formData={ formData }
                  errors={ form.error.level }
                />
              </ModeList>
            </SelectList>

            <span onClick={ openCategoryPopup } className="hyperlink">
              Category missing from list? Click here to upload a new category!
            </span>
            <span onClick={ openGoalPopup } className="hyperlink">
              Goal option missing? Click here to upload a new goal!
            </span>

            <button id={ styles.submit } type="submit">Validate</button>
          </div>
        :
          <Loading />
        }
      </form>
    </Container>
  );
};

/* ===== EXPORTS ===== */
export default StructureForm;