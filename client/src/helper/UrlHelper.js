/* ===== IMPORTS ===== */
import { useSearchParams } from "react-router-dom";

const UrlHelper = () => {
    /* ===== VARIABLES ===== */
    const [searchParams] = useSearchParams();

    /* ===== FUNCTIONS ===== */

    // FUNCTION 1: addAllExistingSearchParams - function that adds all params from the current URL to the url parameter
    // PRECONDITIONS (1 condition):
    // 1.) url: a string representing a url
    // POSTCONDITIONS (2 possible outcomes):
    // if there is one or more search params currently in the url, we add it to the url string
    // otherwise, the url is returned with no changes 
    const addAllExistingSearchParams = url => {
        const params = [];
        searchParams.forEach((value, key) => {
            params.push(`${ key }=${ value }`);
        });

        if (params.length > 0) {
            url += "?";
            url += params.join("&");
        }

        return url;
    };

    return { addAllExistingSearchParams };
};

/* ===== EXPORTS ===== */
export default UrlHelper;