/* ===== IMPORTS ===== */
import { Auth } from "@supabase/auth-ui-react";
import { supabase } from "../../database/SupabaseClient";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../../utils/Contexts";
import styles from "./SignIn.module.css";
import LoginImage from "../../assets/png/login.png";

function SignIn() {
  /* ===== VARIABLES ===== */
  const navigate = useNavigate();
  const theme = { 
    ...ThemeSupa, 
    dark: {
      ...ThemeSupa.dark,
      colors: {
        ...ThemeSupa.dark.colors,
        brand: "rgb(var(--color-nav))",
        brandAccent: "rgb(var(--color-nav-hover))",
        brandButtonText: "rgb(var(--color-text))",
      }
    },
    default: {
      ...ThemeSupa.default,
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
  };

  /* ===== CONTEXTS ===== */

  // user state from user context
  const { user } = useContext(UserContext);

  /* ===== EFFECTS ===== */

  // code that is executed each time the user state is updated
  useEffect(() => {
    if (user.id) {
      navigate("/profile");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  /* ===== SIGN IN COMPONENT ===== */
  return (
    <div className={ styles.signIn }>

      { /* Left: render the sign in form */ }
      <div className={ styles.left }>
        <h2>SMB Elite</h2>
        <Auth 
          supabaseClient={ supabase }
          theme="dark"
          appearance={ { theme } }
          providers={ [] }
          redirectTo={ `${ window.location.origin }/profile` }
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