/* ===== IMPORTS ===== */
import { useLocation, useNavigate } from "react-router-dom";

const ModeratorTab = () => {
    /* ===== VARIABLES ===== */
    const path = useLocation().pathname.split("/");
    const hubType = path[1];
    const pageType = path[2];
    const navigateTo = useNavigate();

    /* ===== FUNCTIONS ===== */

    // FUNCTION 1: handleTabClick - code that is executed when a moderator tab is selected
    // PRECONDITIONS (1 parameter):
	// 1.) otherPageType: a string corresponding to a valid page type (must have a route)
	// POSTCONDITIONS (2 possible outcome):
	// if otherPageType and pageType are the same, this function does nothing
	// otherwise, the user is navigated to the other page
	const handleTabClick = otherPageType => {
		if (otherPageType !== pageType) {
			otherPageType ? navigateTo(`/${ hubType }/${ otherPageType }`) : navigateTo(`/${ hubType }`);
		}
	};

    return { handleTabClick };
};

/* ===== EXPORTS ===== */
export default ModeratorTab;