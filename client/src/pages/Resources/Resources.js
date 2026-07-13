/* ===== IMPORTS ===== */
import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import ScrollHelper from "../../helper/ScrollHelper";

const Resources = () => {
  /* ===== VARIABLES ===== */
  const location = useLocation();
  const path = location.pathname.split("/");
  const pageName = path[2] ? path[2] : "overview";
  const navigateTo = useNavigate();

  /* ===== STATES ===== */
  const [currentPage, setCurrentPage] = useState(pageName);

  /* ===== FUNCTIONS ===== */

  // helper functions
  const { scrollToId } = ScrollHelper();

  // FUNCTION 1: handlePageClick - function that is called when user selects a page from the sidebar
  // PRECONDITIONS (1 parameter):
  // 1.) page: a string which corresponds to the name of a resources page
  // POSTCONDITIONS (2 possible outcomes):
  // if the current page is different from `name`, this function navigates the user to the page defined by name
  // otherwise, this function will scroll the user to the top of `name` page
  const handlePageClick = name => {
    if (currentPage !== name) {
      setCurrentPage(name);
      navigateTo(`/resources/${name}`);
    } else {
      scrollToId(name);
    }
  };

  return { currentPage, setCurrentPage, handlePageClick };
};

/* ===== EXPORTS ===== */
export default Resources;
