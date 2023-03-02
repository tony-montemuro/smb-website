const LoginHelper = () => {
    // FUNCTION 1: validateEmail - determine if email is valid for login attempt
    // PRECONDITINOS (1 parameter):
    // 1.) email: a string that represents the email of the user attempting to login
    // POSTCONDITIONS (1 returns):
    // 1.) error: a string that gives information as to why their is an issue with the email
    const validateEmail = (email) => {
        // initialize variables used in validation process
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;

        // first, validate that the email exists
        if (!email || email.length === 0) {
            return "Error: Email is required.";
        }

        // next, validate that email is well-formatted
        if (!emailRegex.test(email)) {
            return "Error: Invalid email format.";
        }

        return undefined;
    };

    return { validateEmail };
};

export default LoginHelper;