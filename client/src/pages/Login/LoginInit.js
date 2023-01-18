import { useState } from "react";
import { supabase } from "../../database/SupabaseClient";

const LoginInit = () => {
    // states
    const [loggingIn, setLoggingIn] = useState(false);
    const [email, setEmail] = useState("");
    const [emailError, setEmailError] = useState("initState");
    const [isSubmit, setIsSubmit] = useState(false);
    const [hasLoggedIn, setHasLoggedIn] = useState(false);

    const handleChange = (e) => {
        const { value } = e.target;
        setEmail(value);
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmit(true);
        setEmailError(validate(email));
    }

    const handleLogin = async (e) => {
        try {
            setLoggingIn(true);

            const { error } = await supabase.auth.signIn({ email });
            if (error) {
                throw error;
            } 

            setHasLoggedIn(true);
            setLoggingIn(false);
        } catch (error) {
            alert(error.error_description || error.message);
        }
    }

    const validate = (email) => {
        // variables used to check
        let error = "";
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;

        // handing email
        // RULES: required, and must satisfy an email password. (the email input
        // type should handle some of this, but these rules are more strict.)
        if (!email) {
            error = "Error: Email is required."
        } 
        else if (!emailRegex.test(email)) {
            error = "Error: Invalid email format.";
        }

        return error;
    }

    return { loggingIn,
             email, 
             emailError, 
             isSubmit, 
             hasLoggedIn, 
             handleChange, 
             handleSubmit, 
             handleLogin 
    };
}

export default LoginInit;