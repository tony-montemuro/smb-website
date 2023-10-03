/* ===== IMPORTS ===== */
import { useNavigate } from "react-router-dom";

const Users = () => {
    /* ===== VARIABLES ===== */
    const navigate = useNavigate();

    /* ===== FUNCTIONS ===== */

    // FUNCTION 1: navigateToUser - function that navigates the user to a user's page given a user object
    // PRECONDITIONS (1 parameter):
    // 1.) user: a user object corresponding to a valid user
    // POSTCONDITIONS (1 possible outcome):
    // the application navigates to the user's page
    const navigateToUser = user => {
        navigate(`/user/${ user.id }`);
    };

    return { navigateToUser };
};

/* ===== EXPORTS ===== */
export default Users;