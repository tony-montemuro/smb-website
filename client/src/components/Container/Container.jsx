/* ===== IMPORTS ===== */
import { Link } from "react-router-dom";
import styles from "./Container.module.css";

function Container({ title, subtitle, largeTitle, href, children }) {
  /* ===== FUNCTIONS ===== */

  // FUNCTION 1: getTitle - simple function that will return JSX depending on the url parameter
  // PRECONDITIONS: NONE
  // POSTCONDITIONS (2 possible outcomes):
  // if href is defined, return name wrapped in a `Link` tag that navitgtes the user to the page defined by `href`
  // if href is null, simply return the name
  const getTitle = () => {
    return href ? <Link to={ href }>{ title }</Link> : title;
  };

  /* ===== CONTAINER COMPONENT ===== */
  return (
    <div className={ styles.container }>
      { title && 
        <div className={ styles.header }>
          { largeTitle ? <h1>{ getTitle() }</h1> : <h2>{ getTitle() }</h2> }
          { subtitle && <h2>{ subtitle }</h2> }
        </div>
      }
      <div className={ styles.body }>
        { children }
      </div>
    </div>
  );
};

/* ===== EXPORTS ===== */
export default Container;