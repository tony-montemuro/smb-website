import { React, useEffect } from "react";
import LoginInit from "./LoginInit";
import "./login.css";

function Login() {
  const { loggingIn,
          email, 
          emailError, 
          isSubmit, 
          hasLoggedIn, 
          handleChange, 
          handleSubmit, 
          handleLogin 
  } = LoginInit();
  
  useEffect(() => {
    if (emailError.length === 0 && isSubmit) {
      handleLogin();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [emailError]);

  return (
    <div className="log-in">
      <div className="log-in-header">
        <h1>Log In</h1>
        <p>Log in via email below: </p>
      </div>
      <div className="log-in-form">
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="email">Email: </label>
            <input 
              id="email"
              name="email"
              type="email"
              placeholder="Your email"
              value={ email }
              onChange={ handleChange } 
            /><br />
          </div>
          <p>{ emailError !== "initState" ? emailError : ""}</p>
          <button disabled={loggingIn}>Log In</button>
          {hasLoggedIn ? <p>Success! Please check your email to continue.</p> : ""}
        </form>
      </div>
    </div>
  )
}

export default Login;