/* ===== IMPORTS ===== */
import { useContext, useState } from "react";
import { MessageContext } from "../../utils/Contexts";
import FrontendHelper from "../../helper/FrontendHelper.js";
import Update from "../../database/update/Update.js";
import { el } from "date-fns/locale";

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

    // helper functions
    const { capitalize } = FrontendHelper();

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

    const handleSubmit = async e => {
        e.preventDefault();

        const entity = e.target.id;
        const data = form[entity];
        
        setSubmitting(true);
        try {
            await insert(entity, data);
            await refreshSelectDataFunc();
            addMessage(`New ${ capitalize(entity) } was added! You should now be able to select it as an option.`, "success", 8000);
            setSubmitting(false);

        } catch (error) {
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
        }
    };

    return { form, handleChange, handleSubmit };
};

/* ===== EXPORTS ===== */
export default EntitiyAddForm;