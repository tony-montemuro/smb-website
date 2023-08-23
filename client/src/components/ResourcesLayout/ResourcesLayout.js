/* ===== IMPORTS ===== */
import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";

const ResourcesLayout = () => {
    /* ===== VARIABLES ===== */
    const pages = [
        { 
            name: "overview", 
            headers: ["general", "types", "score_calculation", "pausing_rule", "proof_requirements", "regions", "replay_errors", "emulators"]
        },
        {
            name: "getting_started",
            headers: ["capture_cards", "OBS"]
        }
    ];
    const location = useLocation();
    const path = location.pathname.split("/");
    const pageName = path[2] ? path[2] : "overview";
    const navigate = useNavigate();

    /* ===== STATES ===== */
    const [currentPage, setCurrentPage] = useState(pageName);

    /* ===== FUNCTIONS ===== */

    // FUNCTION 1: handleHeaderClick - function that is called when a user selects a header from the sidebar
    // PRECONDITIONS (1 parameter):
    // 1.) header: a string which corresponds to the id of a header on one of the resource pages
    // POSTCONDITIONS (1 possible outcome):
    // using vanilla JS, we scroll to the section based on the header parameter
    const handleHeaderClick = header => {
        const root = document.querySelector(":root");
        const section = document.querySelector(`#${ header }`);
        const yOffset = -parseInt((getComputedStyle(root).getPropertyValue("--navbar-height")))-5;
        const y = section.getBoundingClientRect().top + window.scrollY + yOffset;
        window.scrollTo({ top: y, behavior: "smooth" });
    };

    // FUNCTION 2: handlePageClick - function that is called when user selects a page from the sidebar
    // PRECONDITIONS (1 parameter):
    // 1.) page: a string which corresponds to the name of a resources page
    // POSTCONDITIONS (2 possible outcomes):
    // if the current page is different from `name`, this function navigates the user to the page defined by name
    // otherwise, this function will scroll the user to the top of `name` page
    const handlePageClick = name => {
        if (currentPage !== name) {
            setCurrentPage(name);
            navigate(`${ name }`);
        } else {
            handleHeaderClick(name);
        }
    };

    return { pages, currentPage, handleHeaderClick, handlePageClick };
};

/* ===== EXPORTS ===== */
export default ResourcesLayout;