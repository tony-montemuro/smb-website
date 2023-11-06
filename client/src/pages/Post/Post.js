/* ===== IMPORTS ===== */
import { useContext, useState } from "react";
import { ToastContext, UserContext } from "../../utils/Contexts";
import PostUpdate from "../../database/update/PostUpdate";

const Post = () => {
    /* ===== VARIABLES ===== */
    const formInit = {
        error: undefined,
        submitted: false,
        submitting: false,
        values: { title: "", body: "", link: "", link_description: "" }
    };

    /* ===== CONTEXTS ===== */

    // add message function from toast context
    const { addMessage } = useContext(ToastContext);
 
    // user state from user context
    const { user } = useContext(UserContext);

    /* ===== STATES ===== */
    const [form, setForm] = useState(formInit);

    /* ===== FUNCTIONS ===== */

    // database functions
    const { insertPost } = PostUpdate();

    // FUNCTION 1: handleChange - function that is called when the user modifies the form
    // PRECONDITIONS (1 parameter):
    // 1.) e: an event object generated when the user makes a change to the post form
    // POSTCONDITIONS (1 possible outcome):
    // the form state is updated depending on the id of the e.target object
    const handleChange = e => {
        const { id, value } = e.target;
        setForm({ 
            ...form, 
            error: id === "link_description" ? undefined : form.error,
            submitted: false, values: { ...form.values, [id]: value }
        });
    };

    // FUNCTION 2: validateLinkDescription - determine if link description is valid
    // PRECONDITIONS (2 parameters):
    // 1.) link: a string that represents a post link
    // 2.) description: a string that represents a post link description
    // POSTCONDITIONS (2 possible outcome):
    // if the link is validated, an undefined object is returned
    // otherwise, a string is returned that explains why the link description is invalid
    const validateLinkDescription = (link, description) => {
        // validate that if the link does not exist, the link description also must not exist
        if (link.length === 0 && description.length > 0) return "A link description cannot exist without a link.";

        // validate that if the link does exist, the link description also must exist
        if (link.length > 0 && description.length === 0) return "Link description is required when a link is provided.";

        // if the function gets this far, link description is valid, so return undefined
        return undefined;
    };

    // FUNCTION 3: onPostSubmit - the code that is run when the user submits the post form
    // PRECONDITIONS (1 parameter):
    // 1.) e: an event object generated when the user submits the post form
    // POSTCONDITIONS (3 possible outcomes):
    // if the post is not validated, then the error field of the form state is updated with the appropriate errors, and the function
    // returns early
    // if the post is validated and successfully is inserted to the db, then the submitted field of the form state is set to true
    // if the post is validated, but the insert query fails, then an error is rendered to the user, and the submitting field of the
    // form state is set back to false
    const onPostSubmit = async e => {
        // first, prevent page from reloading
        e.preventDefault();

        // next, let's perform validation of the link description field
		let error = undefined;
		error = validateLinkDescription(form.values.link, form.values.link_description);
        setForm({ ...form, error: error });
		if (error) {
            addMessage("The Link Description field has an error.", "error", 7000);
            return;
        }

        // set form submitting state to true
        setForm({ ...form, submitting: true });

        // finally, attempt to insert the validated post
        try {
            await insertPost({ ...form.values, profile_id: user.profile.id });
            setForm({ ...form, submitted: true });
            addMessage("Post successfully uploaded!", "success", 5000);
        } catch (error) {
            addMessage("Post failed to upload. Try reloading the page.", "error", 7000);
        } finally {
            setForm({ ...form, submitting: false });
        }
    };

    return { form, handleChange, onPostSubmit };
};

/* ===== EXPORTS ===== */
export default Post;