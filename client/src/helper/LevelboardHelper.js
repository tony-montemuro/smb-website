const LevelboardHelper = () => {
    // FUNCTION 1: addPositionToLevelboard
    // Precondition: board is a list of record objects
    // mode is a string, with a value equal to 'time' or 'score'
    // Postcondition: the board object is updated to include position field,
    // which accurately ranks each record based on the {mode} field
    const addPositionToLevelboard = (board, mode) => {
        // variables used to determine position of each submission
        let trueCount = 1;
        let posCount = trueCount;

        // now, iterate through each record, and calculate the position.
        for (let i = 0; i < board.length; i++) {
            const record = board[i];
            record["position"] = posCount;
            trueCount++;
            if (i < board.length-1 && board[i+1][`${mode}`] !== record[`${mode}`]) {
                posCount = trueCount;
            }
        }
    };

    // FUNCTION 2: containsE
    // Precondition: num is a string that represents a number
    // Postcondition: if the string contains an E, true is returned. else, false.
    const containsE = (num) => {
        const numStr = String(num);
        console.log(numStr);
        if (numStr.includes('e')) {
            return true;
        }
        return false;
     }

    // FUNCTION 3: decimalCount
    // Precondition: num is a string that represents a number
    // Postcondition: the number of characters present after the decimal point is returned
    const decimalCount = (num) => {
        const numStr = String(num);
        if (numStr.includes('.')) {
           return numStr.split('.')[1].length;
        };
        
        // if number does not contain a decimal point, return 0
        return 0;
     }

    return { addPositionToLevelboard, containsE, decimalCount };
};

export default LevelboardHelper;