/* ===== IMPORTS ===== */
import { Link } from "react-router-dom";
import styles from "./Navbar.module.css";
import Logo from "../../assets/svg/Logo.jsx";
import MobileLogo from "./Mobile/MobileLogo.jsx";

function NavLogo({ windowWidth, dropdownCutoff, isOpen, setIsOpen }) {
  /* ===== NAV LOGO COMPONENT ===== */
  return windowWidth > dropdownCutoff ?
    <>

      { /* Link to the homepage - left side of navbar */ }
      <div className={ styles.logo }>
        <Link to="/" title="Home">
          <Logo />
        </Link>
      </div>

      { /* List - various links, including games, users, news, resources, support page. */ }
      <div className={ styles.list }>
        <Link to="/games" title="Games">Games</Link>
        <Link to="/users" title="Users">Users</Link>
        <Link to="/news" title="News">News</Link>
        <Link to="/resources" title="Resources">Resources</Link>
        <Link to="/support" title="Support">Support</Link>
      </div>

    </>
  :
    <MobileLogo isOpen={ isOpen } setIsOpen={ setIsOpen } />;
};

/* ===== EXPORTS ===== */
export default NavLogo;