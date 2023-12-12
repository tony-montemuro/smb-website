/* ===== IMPORTS ===== */
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Resources.module.css";
import Container from "../../components/Container/Container.jsx";
import FrontendHelper from "../../helper/FrontendHelper.js";
import PageItem from "./PageItem/PageItem.jsx";
import ResourcesLogic from "./Resources.js";
import ScrollHelper from "../../helper/ScrollHelper";

function Resources({ imageReducer }) {
  /* ===== STATES & FUNCTIONS ===== */
  const { pages, currentPage, setCurrentPage, handlePageClick } = ResourcesLogic(imageReducer);
  const navigateTo = useNavigate();

  // helper functions
  const { scrollToId } = ScrollHelper();
  const { snakeToTitle } = FrontendHelper();

  /* ===== VARIABLES ===== */
  const pageInfo = pages.find(page => page.name === currentPage);

  /* ===== EFFECTS ===== */

  // code that is executed when the component mounts
  useEffect(() => {
    if (!pageInfo) {
      setCurrentPage("overview");
      navigateTo("/resources");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ===== RESOURCES COMPONENT ===== */
  return pageInfo &&
    <div className={ styles.resources }>

      { /* Resources sidebar - render the page controls here.  */ }
      <div className={ styles.sidebar }>
        <ul className={ styles.sidebarList }>
          { pages.map(page => {
            return (
              <PageItem 
                page={ page }
                currentPage={ currentPage }
                headerClickFunc={ scrollToId }
                pageClickFunc={ handlePageClick } 
                key={ page.name } 
              />
            );
          })}
        </ul>
      </div>

      { /* Resources content - render the contents of the resource page */ }
      <div id={ pageInfo.name } className={ styles.content }>
        <h1>{ snakeToTitle(pageInfo.name) }</h1>

        { /* Render each page section */ }
        { Object.keys(pageInfo.headers).map(name => {
          return (
            <div id={ name } key={ name }>
              <Container title={ snakeToTitle(name) }>
                { pageInfo.headers[name] }
              </Container>
            </div>
          );
        })}
      </div>
      
    </div>;
};

/* ===== EXPORTS ===== */
export default Resources;