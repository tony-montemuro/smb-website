const LevelInput = () => {
    /* ===== FUNCTIONS ===== */

    // TODO: after timer rework, this function is no longer necessary
    // FUNCTION 1: timerTypeB2F - code that converts timerType from back-end format to more user-friendly front-end format
    // PRECONDITIONS (1 parameter):
    // 1.) timerType: a string representing a back-end-formatted timer_type enum type
    // POSTCONDITIONS (1 possible outcome):
    // the string is converted into a more understandable format for most users
    const timerTypeB2F = timerType => {
        const words = timerType.split("_");
        let fixedTimer = "";

        for (let i = 0; i < words.length; i++) {
            fixedTimer += words[i];
            if (i < words.length-1) {
                if (["csec", "msec"].includes(words[i+1])) {
                    fixedTimer += ".";
                } else {
                    fixedTimer += ":";
                }
            }
        }

        return fixedTimer.toUpperCase();
    };

    return { timerTypeB2F };
};

/* ===== EXPORTS ===== */
export default LevelInput;