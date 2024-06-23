/* ===== IMPORTS ===== */
import { useState } from "react";

const EntitiyAddForm = () => {
    /* ===== VARIABLES ===== */
    const formInit = {
        monkey: {
            monkey_name: ""
        },
        platform: {
            platform_name: "",
            platform_abb: ""
        },
        region: {
            region_name: ""
        },
        rule: {
            rule_name: ""
        }
    };
    
    /* ===== STATES ===== */
    const [form, setForm] = useState(formInit);

    /* ===== FUNCTIONS ===== */

    // FUNCTION 1: handleChange - code that is executed when the user makes a modification to the form
    // PRECONDITIONS (1 parameter):
    // 1.) entityName: e: the event object generated when the user performs a keystroke on any form field
    // POSTCONDITIONS (1 possible outcome):
    // using the event object, we are able to update the correct field when the user makes changes to form
    const handleChange = e => {
        const { id, value } = e.target;
        const entityName = id.split("_")[0];

        setForm({ ...form, [entityName]: { ...form[entityName], [id]: value } });
    };

    const handleSubmit = e => {
        e.preventDefault();

        const entity = e.target.id;
        console.log(form);
    };

    return { form, handleChange, handleSubmit };
};

/* ===== EXPORTS ===== */
export default EntitiyAddForm;