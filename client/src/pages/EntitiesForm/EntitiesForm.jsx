/* ===== IMPORTS ===== */
import { useEffect, useState } from "react";
import Container from "../../components/Container/Container.jsx";
import EntitiesFormLogic from "./EntitiesForm.js";
import SelectList from "../../components/SelectList/SelectList.jsx";

function EntitiesForm() {
  /* ===== STATES ===== */
  const [selectData, setSelectData] = useState(null);

  /* ===== FUNCTIONS ===== */
  const { form, fetchSelectData, handleInsert, handleUpdate } = EntitiesFormLogic(setSelectData);

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
    </Container>
};

/* ===== EXPORTS ===== */
export default EntitiesForm;