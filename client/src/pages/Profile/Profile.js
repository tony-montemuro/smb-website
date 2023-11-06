/* ===== IMPORTS ===== */
import { ToastContext } from "../../utils/Contexts";
import { useContext } from "react";
import CountriesRead from "../../database/read/CountriesRead";

const Profile = () => {
    /* ===== CONTEXTS ===== */

    // add message function from toast context
    const { addToastMessage } = useContext(ToastContext);

    /* ===== FUNCTIONS ===== */

    // database functions
    const { queryCountries } = CountriesRead();

    // FUNCTION 1: fetchCountries - code that is executed when the `Profile` component mounts, to fetch country data for country select
    // PRECONDITIONS: NONE
    // POSTCONDITIONS (2 possible outcomes):
    // if the query is successful, an array of country objects are simply returned
    // if the query is unsuccessful, this function will render an error message to the screen, and return an undefined object,
    // leaving the `Profile` component stuck loading
    const fetchCountries = async () => {
        try {
            const countries = await queryCountries();
            return countries;
        } catch (error) {
            addToastMessage("There was an issue fetching some of your data.", "error", 7000);
            return undefined;
        };
    };

    return { fetchCountries };
};

/* ===== EXPORTS ===== */
export default Profile;