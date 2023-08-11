/* ===== IMPORTS ===== */
import { useContext, useState } from "react";
import { MessageContext, UserContext } from "../../utils/Contexts";
import PostUpdate from "../../database/update/PostUpdate";

const Post = () => {
    /* ===== VARIABLES ===== */
    const formInit = {
        error: { title: undefined, body: undefined, link: undefined, link_description: undefined },
        submitted: false,
        submitting: false,
        values: { title: "", body: "", link: "", link_description: "" }
    };

    /* ===== CONTEXTS ===== */

    // add message function from message context
    const { addMessage } = useContext(MessageContext);
 
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
        setForm({ ...form, submitted: false, values: { ...form.values, [id]: value } });
    };

    // FUNCTION 2: validateTitle - determine if title is valid
    // PRECONDITIONS (1 parameter):
    // 1.) title: a string that represents a post title
    // POSTCONDITIONS (2 possible outcome):
    // if the title is validated, an undefined object is returned
    // otherwise, a string is returned that explains why the title is invalid
    const validateTitle = title => {
        // first, validate that the title exists
        if (!title) {
            return "Title is required.";
        }

        // next, validate that the title length is 200 characters or less
        if (title.length > 200) {
            return "Title must be 200 characters or less.";
        }

        // if the function gets this far, title is valid, so return undefined
        return undefined;
    };

    // FUNCTION 3: validateBody - determine if body is valid
    // PRECONDITIONS (1 parameter):
    // 1.) body: a string that represents a post body
    // POSTCONDITIONS (2 possible outcome):
    // if the body is validated, an undefined object is returned
    // otherwise, a string is returned that explains why the body is invalid
    const validateBody = body => {
        // first, validate that the body exists
        if (!body) {
            return "Body is required.";
        }

        // next, validate that the body length is 3000 characters or less
        if (body.length > 3000) {
            return "Body must be 200 characters or less.";
        }

        // if the function gets this far, body is valid, so return undefined
        return undefined;
    };

    // FUNCTION 4: validateLink - determine if link is valid
    // PRECONDITIONS (1 parameter):
    // 1.) link: a string that represents a post link
    // POSTCONDITIONS (2 possible outcome):
    // if the link is validated, an undefined object is returned
    // otherwise, a string is returned that explains why the link is invalid
    const validateLink = link => {
        // validate that the link length is 256 characters or less
        if (link.length > 256) {
            return "Link must be 256 characters or less.";
        }

        // if the function gets this far, link is valid, so return undefined
        return undefined;
    };

    // FUNCTION 5: validateLinkDescription - determine if link description is valid
    // PRECONDITIONS (2 parameters):
    // 1.) link: a string that represents a post link
    // 2.) description: a string that represents a post link description
    // POSTCONDITIONS (2 possible outcome):
    // if the link is validated, an undefined object is returned
    // otherwise, a string is returned that explains why the link description is invalid
    const validateLinkDescription = (link, description) => {
        // validate that if the link does not exist, the link description also must not exist
        if (link.length === 0 && description.length > 0) {
            return "A link description cannot exist without a link.";
        }

        // validate that if the link does exist, the link description also must exist
        if (link.length > 0 && description.length === 0) {
            return "Link description is required when a link is provided.";
        }

        // validate that the link description length is 100 characters or less
        if (description.length > 100) {
            return "Link description must be 100 characters or less.";
        }

        // if the function gets this far, link description is valid, so return undefined
        return undefined;
    };

    // FUNCTION 6: onPostSubmit - the code that is run when the user submits the post form
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

        // next, create an error object that will store error messages for each field value that needs to
		// be validated
		const error = {};
		Object.keys(form.error).forEach(field => error[field] = undefined);

        // perform form validation
		error.title = validateTitle(form.values.title);
		error.body = validateBody(form.values.body);
		error.link = validateLink(form.values.link);
		error.link_description = validateLinkDescription(form.values.link, form.values.link_description);

        // if any errors are determined, let's return
        setForm({ ...form, error: error });
		if (Object.values(error).some(e => e !== undefined)) {
            addMessage("One or more form fields had errors.", "error");
            return;
        }

        // set form submitting state to true
        setForm({ ...form, submitting: true });

        // finally, attempt to insert the validated post
        try {
            await insertPost({ ...form.values, profile_id: user.profile.id });
            setForm({ ...form, submitted: true });
            addMessage("Post successfully uploaded!", "success");
        } catch (error) {
            addMessage("Post failed to upload. The database may be experiencing some issues.", "error");
        } finally {
            setForm({ ...form, submitting: false });
        }
    };

    return { form, handleChange, onPostSubmit };
};

/* ===== EXPORTS ===== */
export default Post;