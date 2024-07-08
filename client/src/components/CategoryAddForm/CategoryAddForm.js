/* ===== IMPORTS ===== */
import { useState } from "react";

const CategoryAddForm = (setSubmitting, refreshCategoryDataFunc) => {
    /* ===== VARIABLES ===== */
    const valuesInit = {
        abb: "",
        name: "",
        practice: true
    };
    const formInit = {
        values: valuesInit,
        error: { abb: undefined }
    };

    /* ===== STATES ===== */
    const [form, setForm] = useState(formInit);

    /* ===== FUNCTIONS ===== */

    // FUNCTION 1: handleChange - code that is executed when the user makes a change to a form input
    // PRECONDITIONS (1 parameter):
    // 1.) e: the event object generated when the user updates the form
    // POSTCONDITIONS (1 possible outcome):
    // the form state is updated to match the change the user has made to the form
    const handleChange = e => {
        const { checked, id, value } = e.target;
        setForm({ ...form, values: { ...form.values, [id]: id === "practice" ? checked : value } });
        console.log(form);
    };

    // FUNCTION 2: handleSubmit - code that is executed when the user submits the form
    const handleSubmit = e => {
        console.log("submitted");
    };

    return { form, handleChange, handleSubmit };
};

/* ===== EXPORTS ===== */
export default CategoryAddForm;