import { useState } from "react";
import { supabase } from "../../components/SupabaseClient/SupabaseClient";

const LoginInit = () => {
    const [email, setEmail] = useState("");
    const [emailError, setEmailError] = useState("error");
    const [isSubmit, setIsSubmit] = useState(false);

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
            const { error } = await supabase.auth.signIn({ email });
            if (error) {
                throw error;
            } 
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
            error = "Email is required!"
        } 
        else if (!emailRegex.test(email)) {
            error = "Invalid email format.";
        }

        return error;
    }

    return { email, emailError, isSubmit, handleChange, handleSubmit, handleLogin };
}

export default LoginInit;