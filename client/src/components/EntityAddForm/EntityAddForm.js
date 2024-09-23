/* ===== IMPORTS ===== */
import { useContext, useState } from "react";
import { MessageContext } from "../../utils/Contexts";
import Update from "../../database/update/Update.js";

const EntitiyAddForm = (setSubmitting, refreshSelectDataFunc) => {
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
    
    /* ===== CONTEXTS ===== */

    // add message function from message context
    const { addMessage } = useContext(MessageContext);
    
    /* ===== STATES ===== */
    const [form, setForm] = useState(formInit);

    /* ===== FUNCTIONS ===== */

    // database functions
    const { insert } = Update();

    // FUNCTION 1: handleChange - code that is executed when the user makes a modification to the form
    // PRECONDITIONS (1 parameter):
    // 1.) e: the event object generated when the user performs a keystroke on any form field
    // POSTCONDITIONS (1 possible outcome):
    // using the event object, we are able to update the correct field when the user makes changes to form
    const handleChange = e => {
        const { id, value } = e.target;
        const entityName = id.split("_")[0];

        setForm({ ...form, [entityName]: { ...form[entityName], [id]: value } });
    };
    
    // FUNCTON 2: resetFormByEntity - function that resets each field of an entity form
    // PRECONDITIONS (1 parameter):
    // 1.) entityName: a string representing the name of an entity
    // POSTCONDITIONS (1 possible outcome):
    // `entityName` form is reset to initial value
    const resetFormByEntity = entityName => {
        setForm({ ...form, [entityName]: formInit[entityName] });
    };

    // FUNCTION 3: handleSubmit - code that is executed when the user submits one of the entity forms
    // PRECONDITIONS (1 parameter):
    // 1.) e: the event object generated when the user submits one of the forms
    // POSTCONDITIONS (2 possible outcomes):
    // if the entity is successfully added to the database, render a success message to the user, and reset form
    // if the entity is not successfully added to the databse, render an error message
    const handleSubmit = async e => {
        e.preventDefault();

        const entity = e.target.id;
        const data = form[entity];
        
        setSubmitting(true);
        try {
            // insert data, refresh selectors, and render a success message to the user
            await insert(entity, data);
            await refreshSelectDataFunc();
            resetFormByEntity(entity);
            addMessage(`New ${ entity } was added! You should now be able to select it as an option.`, "success", 8000);

        } catch (error) {
            // error code 23505 - unique constraint
            if (error.code === "23505") {
                let errorMsg;
                if (entity === "platform") {
                    errorMsg = "A platform exists with the same name or abbreviation, or both!";
                } else {
                    errorMsg = `A matching ${ entity } already exists!`;
                }
                addMessage(errorMsg, "error", 10000);
                
            } else {
                addMessage("There was a problem during the entity creation process. If the issue consists, the system may be experiencing an outage.", "error", 15000);
            }

        } finally {
            setSubmitting(false);
        }
    };

    return { form, handleChange, handleSubmit };
};

/* ===== EXPORTS ===== */
export default EntitiyAddForm;