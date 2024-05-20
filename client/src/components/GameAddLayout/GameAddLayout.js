const GameAddLayout = (keys, pageNumber, unlockedPages, setUnlockedPages) => {
    /* ===== VARIABLES ===== */
    const unlockedPagesKey = keys["unlockedPages"];

    /* ===== FUNCTIONS ===== */

    // FUNCTION 1: restoreUnlockedPagesState - function that executes when the GameAddLayout component mounts
    // PRECONDITIONS: NONE
    // POSTCONDITIONS (2 possible outcomes):
    // if the user has unlocked pages according to local storage, restore unlocked pages to reflect that
    // otherwise, this function does nothing
    const restoreUnlockedPagesState = () => {
        const localUnlockedPages = JSON.parse(localStorage.getItem(unlockedPagesKey));
        if (localUnlockedPages) {
            setUnlockedPages(localUnlockedPages);
        } else {
            localStorage.setItem(unlockedPagesKey, JSON.stringify(unlockedPages));
        }
    };

    // FUNCTION 2: unlockNextPage - function that can unlock the next page after form validation
    // PRECONDITIONS (1 condition): this function should run each time the user performs a form validation, and succeeds
    // POSTCONDITIONS (2 possible outcomes):
    // if the number of unlocked pages is the same as the page number, this means we have NOT unlocked the next page,
    // so we can do so
    // if the number of unlocked pages differs from the page number, this means we have ALREADY unlocked the next page, so
    // we should do nothing
    const unlockNextPage = () => {
        const numPages = unlockedPages.length;
        if (pageNumber === numPages) {
            const nextPageNumber = unlockedPages.length+1;
            const newUnlockedPages = [...unlockedPages, nextPageNumber];
            setUnlockedPages(newUnlockedPages);
            localStorage.setItem(unlockedPagesKey, JSON.stringify(newUnlockedPages));
        }
    };

    return { restoreUnlockedPagesState, unlockNextPage };
};

export default GameAddLayout;