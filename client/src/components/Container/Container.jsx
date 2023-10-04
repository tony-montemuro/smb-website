/* ===== IMPORTS ===== */
import { Link } from "react-router-dom";
import styles from "./Container.module.css";

function Container({ name, href = null, isLargeHeader = true, children }) {
  /* ===== FUNCTIONS ===== */

  // FUNCTION 1: getHeader - simple function that will return JSX depending on the url parameter
  // PRECONDITIONS: NONE
  // POSTCONDITIONS (2 possible outcomes):
  // if href is defined, return name wrapped in a `Link` tag that navitgtes the user to the page defined by `href`
  // if href is null, simply return the name
  const getHeader = () => {
    return href ? <Link to={ href }>{ name }</Link> : name;
  };

  /* ===== CONTAINER COMPONENT ===== */
  return (
    <div className={ styles.container }>
      <div className={ styles.header }>
        { isLargeHeader ? <h1>{ getHeader() }</h1> : <h2>{ getHeader() }</h2> }
      </div>
      <div className={ styles.body }>
        { children }
      </div>
    </div>
  );
};

/* ===== EXPORTS ===== */
export default Container;