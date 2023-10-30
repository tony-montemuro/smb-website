/* ===== IMPORTS ===== */
import { Link } from "react-router-dom";
import styles from "./Mobile.module.css";
import CloseButton from "../../CloseButton/CloseButton.jsx";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import SimpleLogo from "../../../assets/svg/SimpleLogo.jsx";

function MobileLogo({ isOpen, setIsOpen }) {
  /* ===== MOBILE LOGO COMPONENT ===== */
  return (
    <>

      {/* Simplified logo, which will activate dropdown when pressed */}
      <div className={ styles.mobileLogo } onClick={ () => setIsOpen(true) }>
        <div id={ styles.simpleLogo }>
          <SimpleLogo />
        </div>
        <div id={ styles.hamburger }>
          <MenuRoundedIcon />
        </div>
      </div>


      { /* Dropdown element, which should only render if `isOpen` is set to true */ }
      <div className={ `${ styles.dropdown }${ isOpen ? ` ${ styles.open }` : "" }` }>
        <div className={ `${ styles.dropdownInner } ${ styles.innerLeft }` }>
          <div className={ styles.dropdownClose }>
            <CloseButton onClose={ () => setIsOpen(false) } />
          </div>
          <div className={ styles.dropdownLinks }>
            <Link to="/" onClick={ () => setIsOpen(false) }>Home</Link>
            <Link to="/games" onClick={ () => setIsOpen(false) }>Games</Link>
            <Link to="/users" onClick={ () => setIsOpen(false) }>Users</Link>
            <Link to="/news" onClick={ () => setIsOpen(false) }>News</Link>
            <Link to="/resources" onClick={ () => setIsOpen(false) }>Resources</Link>
            <Link to="/support" onClick={ () => setIsOpen(false) }>Support</Link>
          </div>
        </div>
      </div>

    </>
  );
};

/* ===== EXPORTS ===== */
export default MobileLogo;