/* ===== IMPORTS ===== */
import { useEffect, useState } from "react";
import styles from "./StructureForm.module.css";
import CategoryAddForm from "../../components/CategoryAddForm/CategoryAddForm.jsx";
import Container from "../../components/Container/Container.jsx";
import Loading from "../../components/Loading/Loading.jsx";
import ModeList from "./ModeList/ModeList.jsx";
import Popup from "../../components/Popup/Popup.jsx";
import SelectList from "../../components/SelectList/SelectList.jsx";
import StructureFormLogic from "./StructureForm.js";
import LevelList from "./LevelList/LevelList.jsx";

function StructureForm() {
  /* ===== STATES & FUNCTIONS ===== */
  const [formData, setFormData] = useState(undefined);
  const [submittingCategory, setSubmittingCategory] = useState(false);

  // states & functions from the js file
  const { 
    form,
    addCategory,
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
    openPopup,
    closePopup
  } = StructureFormLogic(setFormData);

  /* ===== EFFECTS ===== */

  // code that is executed when the component mounts
  useEffect(() => {
    populateForm();
    queryFormData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ===== STRUCTURE FORM COMPONENT ===== */
  return (
    <Container title="Game Structure">

      { /* Popup */ }
      <Popup 
				renderPopup={ addCategory } 
				setRenderPopup={ closePopup } 
				width="500px"
				disableClose={ submittingCategory }
			>
				<CategoryAddForm 
          submitting={ submittingCategory } 
          setSubmitting={ setSubmittingCategory }
          refreshCategoryDataFunc={ updateFormCategories }
        />
			</Popup>

      { /* Structure form */ }
      <form className={ styles.structureForm }>
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
        
        { /* Only render inputs if user has selected  */ }
        { formData ?
          <div style={ { width: "100%" } }>
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
                entityName: "name"
              }}
              colorBackgrounds
            >
              <ModeList 
                modes={ form.values.mode }
                handleInsert={ handleModeInsert }
                handleChange={ handleModeUpdate }
                handleDelete={ handleModeDelete }
              >
                <LevelList 
                  levels={ form.values.level }
                  handleInsert={ handleLevelInsert }
                  handleChange={ handleLevelChange }
                  handleDelete={ handleLevelDelete }
                  formData={ formData }
                />
              </ModeList>
            </SelectList>
            <span onClick={ openPopup } className="hyperlink">
              Category missing from list? Click here to upload a new category!
            </span>
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