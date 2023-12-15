/* ===== IMPORTS ===== */
import { MessageContext, UserContext } from "../../utils/Contexts";
import { supabase } from "../../database/SupabaseClient";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./SignIn.module.css";
import Logo from "../../assets/svg/Logo.jsx";
import LoginImage from "../../assets/png/login.png";
import MemoizedAuth from "./MemoizedAuth.jsx";

function SignIn() {
  /* ===== VARIABLES ===== */
  const navigateTo = useNavigate();
  const theme = {
    theme: {
      ...ThemeSupa, 
      dark: {
        ...ThemeSupa.dark,
        colors: {
          ...ThemeSupa.dark.colors,
          brand: "rgb(var(--color-button))",
          brandAccent: "rgb(var(--color-button-hover))",
          brandButtonText: "black",
        }
      },
      default: {
        ...ThemeSupa.default,
        colors: {
          ...ThemeSupa.default.colors,
          brand: "rgb(var(--color-button))",
          brandAccent: "rgb(var(--color-button-hover))",
          brandButtonText: "black",
          inputText: "white"
        },
        fonts: {
          bodyFontFamily: "var(--font)",
          buttonFontFamily: "var(--font)",
          inputFontFamily: "var(--font)",
          labelFontFamily: "var(--font)"
        },
        fontSizes: {
          baseBodySize: "15px",
          baseInputSize: "16px",
          baseLabelSize: "16px",
          baseButtonSize: "16px"
        }
      }
    }
  };

  /* ===== CONTEXTS ===== */

  // add message function from message context
  const { addMessage } = useContext(MessageContext);

  // user state from user context
  const { user } = useContext(UserContext);

  /* ===== EFFECTS ===== */

  // code that is executed each time the user state is updated
  useEffect(() => {
    if (user.id) {
      addMessage("Login successful!", "success", 5000);
      navigateTo("/");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  /* ===== SIGN IN COMPONENT ===== */
  return (
    <div className={ styles.signIn }>

      { /* Left: render the sign in form */ }
      <div className={ styles.left }>
        <div className={ styles.logo }>
          <Logo />
        </div>
        <MemoizedAuth 
          supabaseClient={ supabase }
          theme="dark"
          appearance={ theme }
          providers={ [] }
          redirectTo={ `${ window.location.origin }` }
        />
      </div>

      { /* Right: render a fancy image (1000px) */ }
      <div className={ styles.right }>
        <img src={ LoginImage } alt="Login decorative feature"></img>
      </div>

    </div>
  );
};

/* ===== EXPORTS ===== */
export default SignIn;