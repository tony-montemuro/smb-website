/* ===== IMPORTS ===== */
import { MessageContext } from "../../utils/Contexts";
import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import Read from "../../database/read/Read.js";

const GameAddLayout = (page, setPage, setEntitiesData) => {
    /* ===== CONTEXTS ===== */

    // add message function from message context
    const { addMessage } = useContext(MessageContext);
    
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

    // FUNCTION 2: restoreUnlockedPagesState - function that executes when the GameAddLayout component mounts
    // PRECONDITIONS: NONE
    // POSTCONDITIONS (2 possible outcomes):
    // if the user has unlocked pages according to local storage, restore unlocked pages to reflect that
    // otherwise, this function does nothing
    const restoreUnlockedPagesState = () => {
        const localUnlockedPages = JSON.parse(localStorage.getItem(unlockedPagesKey));
        const pageNumber = parseInt(localStorage.getItem(currentPageKey));

        if (localUnlockedPages) {
            setPage({ number: pageNumber, unlocked: localUnlockedPages });
            switchPages(pageNumber);
        } else {
            localStorage.setItem(unlockedPagesKey, JSON.stringify(page.unlocked));
            localStorage.setItem(currentPageKey, "1");
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
    // if we fetch all the data successfully from the database, update the entitiesData state
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

    return { 
        pageNames,
        keys,
        switchPages,
        restoreUnlockedPagesState,
        unlockNextPage,
        fetchEntitiesData
    };
};

export default GameAddLayout;