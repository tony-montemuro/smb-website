/* ===== IMPORTS ===== */
import styles from "./SimpleForms.module.css";
import Container from "../../../components/Container/Container.jsx";
import LogoutIcon from "@mui/icons-material/Logout";
import Signout from "../../../database/authentication/Signout.js";

function SignoutForm() {
  /* ===== FUNCTIONS ===== */

  // database functions
  const { signOut } = Signout();

  /* ===== SIGNOUT FORM COMPONENT ====== */
  return (
    <Container title="Sign Out" isLargeHeader={ false }>
      <div className={ styles.form }>
        <span><strong>Note: </strong>You can also sign out by clicking the <div className="inline-icon"><LogoutIcon /></div> icon in the navigation bar.</span>
        <button type="button" onClick={ signOut }>Sign Out</button>
      </div>
    </Container>
  );
};

/* ===== EXPORTS ===== */
export default SignoutForm;