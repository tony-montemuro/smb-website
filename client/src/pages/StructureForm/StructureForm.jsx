/* ===== IMPORTS ===== */
import styles from "./StructureForm.module.css";
import Container from "../../components/Container/Container.jsx";

function StructureForm() {
  /* ===== STRUCTURE FORM COMPONENT ===== */
  return (
    <Container title="Game Structure">
      <form className={ styles.structureForm }>
        <span>On this screen, you will create and organize high score / fast time charts.</span>
        <h3>Categories</h3>
        <span>Within a single game, a <strong>category</strong> is the largest grouping of charts. Charts in the same <strong>category</strong> are ranked together.</span>
      </form>
    </Container>
  );
};

/* ===== EXPORTS ===== */
export default StructureForm;