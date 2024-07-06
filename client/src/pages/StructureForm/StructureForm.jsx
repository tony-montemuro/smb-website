/* ===== IMPORTS ===== */
import { useEffect, useState } from "react";
import styles from "./StructureForm.module.css";
import Container from "../../components/Container/Container.jsx";
import SelectList from "../../components/SelectList/SelectList.jsx";
import StructureFormLogic from "./StructureForm.js";

function StructureForm() {
  /* ===== STATES & FUNCTIONS ===== */
  const [categories, setCategories] = useState(undefined);

  // states & functions from the js file
  const { form, queryCategories, handleInsert, handleUpdate } = StructureFormLogic(setCategories);

  /* ===== EFFECTS ===== */

  // code that is executed when the component mounts
  useEffect(() => {
    queryCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ===== STRUCTURE FORM COMPONENT ===== */
  return (
    <Container title="Game Structure">
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
                <strong>"Practice Mode" style</strong> - This is a traditional grouping of charts, that the average user is most familiar with.
                Submissions to charts within categories of this style are <strong>ranked by all 3 types:</strong> world records, totalizer, 
                and medal table. High scores / fast time charts are <strong>restricted to descending order</strong>, meaning the higher the high 
                score / fast time, the better. Some example "Practice Mode" style categories include Practice Mode, Miscellaneous
                Practice Mode, Practice Mode (Jumps), & Supernova. <strong>Traditional IL charts should be within this style of category.</strong>
              </li>
              <li>
                "Non-Practice Mode" style - This is a less common grouping of charts, that some users of the website may be familiar
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
        { categories &&
          <SelectList
            entities={ form.values.category }
            inputData={{
              id: "category",
              label: "Categories",
              handleChange: handleUpdate,
              handleInsert: handleInsert,
              error: form.error.monkey
            }}
            selectData={{ 
              entities: categories,
              entityName: "category",
              entityNameAlt: "name"
            }}
          />
        }
      </form>
    </Container>
  );
};

/* ===== EXPORTS ===== */
export default StructureForm;