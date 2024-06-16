/* ===== IMPORTS ===== */
import { useContext } from "react";
import { MessageContext } from "../../utils/Contexts";
import Read from "../../database/read/Read.js";

const EntitiesForm = () => {
    /* ===== CONTEXTS ===== */

    // add message function from message context
    const { addMessage } = useContext(MessageContext);

    /* ===== FUNCTIONS ===== */

    // db functions
    const { queryAll } = Read();

    // FUNCTION 1: fetchFormData - function that grabs all the data we need for the form
    // PRECONDITIONS (1 condition):
    // this function should be called when the `EntitiesForm` component mounts
    // POSTCONDITIONS (2 possible outcomes):
    // if we fetch all the data successfully from the database, update the formData state
    // otherwise, render an error message to the user, and do not update the `formData` state
    const fetchFormData = async () => {
        try {
            const [monkeys, platforms, regions, rules] = await Promise.all(
                [
                    queryAll("monkey", "id"),
                    queryAll("platform", "id"),
                    queryAll("region", "id"),
                    queryAll("rule", "id")
                ]
            );
        } catch (error) {
            addMessage("Form data failed to load. If reloading the page does not work, the system may be experiencing an outage.", "error", 15000);
        }
    };
};

/* ===== EXPORTS ===== */
export default EntitiesForm;