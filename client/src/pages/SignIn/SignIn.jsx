/* ===== IMPORTS ===== */
import { UserContext } from "../../utils/Contexts";
import { useContext, useEffect } from "react";
import { useNavigate } from "react-router";
import styles from "./SignIn.module.css";
import Auth from "./Auth/Auth.jsx";
import Logo from "../../assets/svg/Logo.jsx";
import LoginImage from "../../assets/png/login.png";

function SignIn() {
  /* ===== VARIABLES ===== */
  const navigateTo = useNavigate();

  /* ===== CONTEXTS ===== */

  // user state from user context
  const { user } = useContext(UserContext);

  /* ===== EFFECTS ===== */

  // code that is executed each time the user state is updated
  useEffect(() => {
    if (user.id) {
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
        <Auth />
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
