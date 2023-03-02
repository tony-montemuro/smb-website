import "./login.css";
import React from "react";
import LoginInit from "./LoginInit";

function Login() {
  const { 
    email, 
    userState,
    handleChange, 
    handleLogin 
  } = LoginInit();

  return (
    <div className="login-container">
      <div className="login">
        <div className="login-header">
          <h1>Log In</h1>
          <p>Log in via email below: </p>
        </div>
        <div className="login-form">
          <form onSubmit={ handleLogin }>
            <div className="login-email-field">
              <label htmlFor="email">Email: </label>
              <input 
                id="email"
                type="email"
                placeholder="Your email"
                value={ email.name }
                onChange={ handleChange } 
              />
            </div>
            { email.error ? 
              <p> { email.error }</p>
            :
              null
            }
            <button disabled={ userState === "logging" }>Log In</button>
            { userState === "complete" ?
              <p>Success! Please check your email to continue.</p>
            : 
              null
            }
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;