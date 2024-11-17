/* ===== IMPORTS ===== */
import { useSearchParams } from "react-router-dom";

const UrlHelper = () => {
    /* ===== VARIABLES ===== */
    const versionKey = "version";
    
    /* ===== STATES ===== */
    const [searchParams, setSearchParams] = useSearchParams();

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

    // FUNCTION 2: getInitialVersion - given the version parameters (if any), & game object, determine the initial version
    // PRECONDITIONS (1 parameter):
    // 1.) game: an object containing information about the game defined in the path
    // POSTCONDITIONS (3 possible outcomes)
    // if the version search parameter is defined, and corresponds to a version of the game, return that version
    // if the version search parameter is defined, but does not correspond to a version of the game, return the final version,
    // if exists. otherwise, return undefined
    // if the version search parameter is undefined, return the final version, if exists. otherwise, undefined.
    const getInitialVersion = game => {
        const versionParam = searchParams.get(versionKey);

        // version could be called `version`, or `versions`
        let gameVersionKey;
        if ("version" in game) {
            gameVersionKey = "version";
        } else if ("versions" in game) {
            gameVersionKey = "versions";
        }

        // if version param is set, let's attempt to match with a version within the game
        if (versionParam) {
            const version = game[gameVersionKey]?.find(v => v.version === versionParam);

            if (version) {
                return version;
            } else {
                setSearchParams(searchParams.delete(versionKey));
            }
        }
       
        return game[gameVersionKey]?.at(-1);
    }

    return { addAllExistingSearchParams, getInitialVersion };
};

/* ===== EXPORTS ===== */
export default UrlHelper;