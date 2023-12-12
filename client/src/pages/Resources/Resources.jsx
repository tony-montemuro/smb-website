/* ===== IMPORTS ===== */
import { MessageContext } from "../../utils/Contexts.js";
import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Resources.module.css";
import Container from "../../components/Container/Container.jsx";
import FrontendHelper from "../../helper/FrontendHelper.js";
import PageItem from "./PageItem/PageItem.jsx";
import ResourcesLogic from "./Resources.js";
import ScrollHelper from "../../helper/ScrollHelper";

function Resources({ imageReducer }) {
  /* ===== CONTEXTS ===== */

  // add message function from message context
  const { addMessage } = useContext(MessageContext);

  /* ===== STATES & FUNCTIONS ===== */
  const { pages, currentPage, handlePageClick } = ResourcesLogic(imageReducer);
  const navigate = useNavigate();

  // helper functions
  const { scrollToId } = ScrollHelper();
  const { snakeToTitle } = FrontendHelper();

  /* ===== VARIABLES ===== */
  const pageInfo = pages.find(page => page.name === currentPage);

  /* ===== EFFECTS ===== */

  // code that is executed when the component mounts
  useEffect(() => {
    console.log(pageInfo);
    if (!pageInfo) {
      addMessage("Page does not exist.", "error", 5000);
      navigate("/");
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