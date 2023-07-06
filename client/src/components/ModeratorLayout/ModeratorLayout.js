/* ===== IMPORTS ===== */
import { useLocation, useNavigate } from "react-router-dom";

const ModeratorLayout = () => {
    /* ===== VARIABLES ===== */
    const pageType = useLocation().pathname.split("/")[2];
    const navigate = useNavigate();

    /* ===== FUNCTIONS ===== */
    // FUNCTION 1: handleTabClick - code that is executed when a moderator layout tab is selected
    // PRECONDITIONS (1 parameter):
	// 1.) otherPageType: a string, either "approvals", "reports", "post", or undefined
	// POSTCONDITIONS (2 possible outcome):
	// if otherPageType and pageType are the same, this function does nothing
	// otherwise, the user is navigated to the other page
	const handleTabClick = otherPageType => {
		if (otherPageType !== pageType) {
			otherPageType ? navigate(`/moderator/${ otherPageType }`) : navigate("/moderator");
		}
	};

    return { handleTabClick };
};

/* ===== EXPORTS ===== */
export default ModeratorLayout;