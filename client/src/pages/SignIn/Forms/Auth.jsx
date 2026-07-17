/* ===== IMPORTS ===== */
import { supabase } from "../../../database/SupabaseClient.jsx";
import { useState } from "react";
import Email from "./Email.jsx";
import AuthLogic from "./Auth.js";
import Password from "./Password.jsx";
import Links from "./Links.jsx";

function Auth() {
  /* ===== STATES & FUNCTIONS ===== */
  const {
    email,
    password,
    mode,
    handleEmailChange,
    handlePasswordChange,
    getButtonText,
    toSignIn,
    toSignUp,
    toForgotPassword
  } = AuthLogic();

  const [error, setError] = useState({ email: "", password: "" });
  // const [loading, setLoading] = useState(false);

  /* ===== AUTH COMPONENT ===== */
  return (
    <form>
      <Email email={ email } handleEmailChange={ handleEmailChange } errorMsg={ error.email } />
      <Password password={ password } handlePasswordChange={ handlePasswordChange } mode={ mode } errorMsg={ error.password } />
      <button type="submit">{ getButtonText() }</button>
      <Links mode={ mode } signIn={ toSignIn } signUp={ toSignUp } forgotPassword={ toForgotPassword } />
    </form>
  )
}

/* ===== EXPORTS ===== */
export default Auth;
