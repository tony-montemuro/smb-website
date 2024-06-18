/* ===== IMPORTS ===== */
import { useEffect, useState } from "react";
import Container from "../../components/Container/Container.jsx";
import EntitiesFormLogic from "./EntitiesForm.js";
import SelectList from "../../components/SelectList/SelectList.jsx";

function EntitiesForm() {
  /* ===== STATES ===== */
  const [selectData, setSelectData] = useState(null);

  /* ===== FUNCTIONS ===== */
  const { form, fetchSelectData, handleInsert } = EntitiesFormLogic(setSelectData);

  /* ===== EFFECTS ===== */

  // code that is executed when the component mounts
  useEffect(() => {
    fetchSelectData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ===== ENTITIES FORM COMPONENT ===== */
  return selectData &&
    <Container title="Game Entities">
      <SelectList
        entities={ form.values.monkeys }
        inputData={{
          id: "monkey",
          label: "Monkeys",
          handleChange: () => {},
          handleInsert: handleInsert
        }}
        selectData={{ 
          entities: selectData.monkeys,
          entityName: "monkey",
          entityNameAlt: "monkey_name"
        }}
      />
      <SelectList
        entities={ form.values.platforms }
        inputData={{
          id: "platform",
          label: "Platforms",
          handleChange: () => {},
          handleInsert: handleInsert
        }}
        selectData={{ 
          entities: selectData.platforms,
          entityName: "platform",
          entityNameAlt: "platform_name"
        }}
      />
      <SelectList
        entities={ form.values.regions }
        inputData={{
          id: "region",
          label: "Regions",
          handleChange: () => {},
          handleInsert: handleInsert
        }}
        selectData={{ 
          entities: selectData.regions,
          entityName: "region",
          entityNameAlt: "region_name"
        }}
      />
      <SelectList
        entities={ form.values.rules }
        inputData={{
          id: "rule",
          label: "Rules",
          handleChange: () => {},
          handleInsert: handleInsert
        }}
        selectData={{ 
          entities: selectData.rules,
          entityName: "rule",
          entityNameAlt: "rule_name"
        }}
      />
    </Container>
};

/* ===== EXPORTS ===== */
export default EntitiesForm;