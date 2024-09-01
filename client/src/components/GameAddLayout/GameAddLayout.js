/* ===== IMPORTS ===== */
import { AppDataContext, MessageContext } from "../../utils/Contexts";
import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import Read from "../../database/read/Read.js";
import RPCRead from "../../database/read/RPCRead.js";

const GameAddLayout = (page, setPage, pageInit, setEntitiesData, setStructureData) => {
    /* ===== CONTEXTS ===== */

    // add message function from message context
    const { addMessage } = useContext(MessageContext);

    // app data state from app data context
    const { appData } = useContext(AppDataContext);
    
    /* ===== VARIABLES ===== */
    const pageNames = [
        "Main Information",
        "Game Entities",
        "Game Structure",
        "Game Assets",
        "Summary"
    ];
    const keys = {
        currentPage: "GAME_ADD_CURRENT_PAGE",
        metadata: "GAME_ADD_METADATA",
        entities: "GAME_ADD_ENTITIES",
        structure: "GAME_ADD_STRUCTURE",
        assets: "GAME_ADD_ASSETS",
        unlockedPages: "GAME_ADD_UNLOCKED_PAGES"
    };
    const unlockedPagesKey = keys["unlockedPages"];
    const currentPageKey = keys["currentPage"];
    const navigateTo = useNavigate();

    /* ===== FUNCTIONS ===== */

    // database functions
    const { queryAll } = Read();
    const { getChartTypes, getTimerTypes } = RPCRead();

    // FUNCTION 1: switchPages - function that will navigate user to page based on page number
    // PRECONDITIONS (1 parameter):
    // 1.) pageNumber - an integer, the current page number
    // POSTCONDITIONS (1 possible outcome):
    // the user is navigated to a page based on the page number, and the page number is updated in local storage
    const switchPages = pageNumber => {
        const urls = {
            1: "",
            2: "game-entities",
            3: "game-structure",
            4: "game-assets",
            5: "summary"
        };

        navigateTo(urls[pageNumber]);
        localStorage.setItem(currentPageKey, pageNumber.toString());
    };

    // FUNCTION 2: restoreUnlockedPagesState - function that executes when the GameAddLayout component mounts, or when
    // the form resets
    // PRECONDITIONS (1 parameter):
    // 1.) forceReset: an optional boolean parameter. when passed, we force a reset on the page state in local storage
    // POSTCONDITIONS (2 possible outcomes):
    // if the user has unlocked pages according to local storage, and we are NOT force resetting, restore unlocked pages to
    // reflect that
    // otherwise, this function sets local storage to 
    const restoreUnlockedPagesState = (forceReset = false) => {
        const localUnlockedPages = JSON.parse(localStorage.getItem(unlockedPagesKey));
        const pageNumber = parseInt(localStorage.getItem(currentPageKey));
        console.log(localUnlockedPages, pageNumber);

        if (localUnlockedPages) {
            setPage({ number: pageNumber, unlocked: localUnlockedPages });
            switchPages(pageNumber);
        } else {
            localStorage.setItem(unlockedPagesKey, JSON.stringify(pageInit.unlocked));
            localStorage.setItem(currentPageKey, pageInit.number.toString());
        }
    };

    // FUNCTION 3: unlockNextPage - function that can unlock the next page after form validation
    // PRECONDITIONS (1 condition): this function should run each time the user performs a form validation, and succeeds
    // POSTCONDITIONS (2 possible outcomes):
    // if the number of unlocked pages is the same as the page number, this means we have NOT unlocked the next page,
    // so we can do so, and display success message to user
    // if the number of unlocked pages differs from the page number, this means we have ALREADY unlocked the next page, so
    // we simply let the user know the information was re-validated
    const unlockNextPage = () => {
        const numPages = page.unlocked.length;
        if (page.number === numPages) {
            const nextPageNumber = numPages+1;
            let newUnlockedPages = [...page.unlocked, nextPageNumber];

            // special case: since page 4 is currently optional, also unlock page 5 (this may change in the future!)
            if (page.number === 3) {
                newUnlockedPages = [...newUnlockedPages, nextPageNumber+1]    
            }

            setPage({ ...page, unlocked: newUnlockedPages });
            localStorage.setItem(unlockedPagesKey, JSON.stringify(newUnlockedPages));
            addMessage(`Information validated! Please proceed to the ${ pageNames[numPages] } section.`, "success", 8000);
        } else {
            addMessage("Information re-validated!", "success", 5000);
        }
    };

    // FUNCTION 4: fetchEntitiesData - function that grabs all the data we need for entities in the form
    // PRECONDITIONS (1 condition):
    // this function should be called when the `GameAddLayout` component mounts
    // POSTCONDITIONS (2 possible outcomes):
    // if we fetch all the data successfully from the database, update the `entitiesData` state
    // otherwise, render an error message to the user, and do not update the `entitiesData` state
    const fetchEntitiesData = async () => {
        try {
            const [monkey, platform, region, rule] = await Promise.all(
                [
                    queryAll("monkey", "id"),
                    queryAll("platform", "id"),
                    queryAll("region", "id"),
                    queryAll("rule", "id")
                ]
            );
            setEntitiesData({
                monkey,
                platform,
                region,
                rule
            });

        } catch (error) {
            addMessage("Entities data failed to load. If reloading the page does not work, the system may be experiencing an outage.", "error", 15000);
        }
    };

    // FUNCTION 5: getTransformedCategories - function that takes `appData.categories` state from appData context, and 
    // converts to array
    // PRECONDITIONS: NONE
    // POSTCONDITIONS (1 possible outcomes):
    // the state is transform from a mapping of category names to category objects, to an array of category objects,
    // sorted by id, then practice flag
    const getTransformedCategories = () => {
        return Object.values(appData.categories).toSorted((b, a) => b.practice - a.practice);
    };

    // FUNCTION 6: fetchStructureData - function that grabs all the data we need for structure in the form
    // PRECONDITIONS (1 condition):
    // this function should be called when the `GameAddLayout` component mounts
    // POSTCONDITIONS (2 possible outcomes):
    // if we fetch all the data successfully from the database, update the `structureData` state
    // otherwise, render an error message to the user, and do not update the `structureData` state
    const fetchStructureData = async () => {
        try {
            const [chartTypes, timerTypes] = await Promise.all(
                [getChartTypes(), getTimerTypes()]
            );
            let categoryList = getTransformedCategories();

            setStructureData({ categories: categoryList, chartTypes, timerTypes });
        } catch (error) {
            addMessage("Structure data failed to load. If reloading the page does not work, the system may be experiencing an outage.", "error", 15000);
        }
    };

    // FUNCTION 7: updateFormCategories - function that updates the `categories` field of the `formData` state
    // PRECONDITIONS: NONE
    // POSTCONDITIONS (2 possible outcomes):
    // if any categories exist, we assume a success, and update the categories state
    // otherwise, this function simply renders an error message
    const updateStructureCategories = async () => {
        setStructureData(prevState => ({ ...prevState, categories: getTransformedCategories() }));
    };

    // FUNCTION 8: resetForm - function that resets the form to it's default state
    // PRECONDITIONS: NONE
    // POSTCONDITIONS (1 possible outcome):
    // all data in `localStorage` relating to adding a game is wiped, the unlocked pages are reset
    // back to only the first, and the user is redirected back to the first page
    const resetForm = () => {
        // reset local storage
        Object.values(keys).forEach(key => {
            localStorage.removeItem(key);
        });

        // reset page state
        setPage(pageInit);
        restoreUnlockedPagesState();
    };

    return { 
        pageNames,
        keys,
        switchPages,
        restoreUnlockedPagesState,
        unlockNextPage,
        fetchEntitiesData,
        fetchStructureData,
        updateStructureCategories,
        resetForm
    };
};

export default GameAddLayout;