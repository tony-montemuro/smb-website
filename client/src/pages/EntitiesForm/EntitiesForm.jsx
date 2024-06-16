/* ===== IMPORTS ===== */
import Container from "../../components/Container/Container.jsx";
import SelectList from "../../components/SelectList/SelectList.jsx";

function EntitiesForm() {
  /* ===== ENTITIES FORM COMPONENT ===== */
  return (
    <Container title="Game Entities">
      <SelectList name="Monkeys" />
      <SelectList name="Platforms" />
      <SelectList name="Regions" />
      <SelectList name="Rules" />
    </Container>
  );
};

/* ===== EXPORTS ===== */
export default EntitiesForm;