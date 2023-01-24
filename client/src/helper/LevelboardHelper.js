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
    const containsE = num => {
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
    const decimalCount = num => {
        const numStr = String(num);
        if (numStr.includes('.')) {
           return numStr.split('.')[1].length;
        };
        
        // if number does not contain a decimal point, return 0
        return 0;
     }

     // FUNCTION 4: dateB2F ("date backend-to-frontend")
     // Precondition: the date parameter can take two possible states: a timestamptz formatted date, or null
     // Postcondition: if null, the function will return the current date. otherwise, the function will return the formatted date, 
     // converted to the client's location. output will have the following format: YYYY-MM-DD
     const dateB2F = date => {
        const d = date ? new Date(date) : new Date();
        const year = d.getFullYear();
        const month = ("0"+(d.getMonth()+1)).slice(-2);
        const day = ("0"+d.getDate()).slice(-2);
        return `${year}-${month}-${day}`;
     };

     // FUNCTION 5: dateF2B ("date frontend-to-backend")
     // Precondition: the date parameter can take two possible states: a date with the following format: YYYY-MM-DD, or null.
     // Postcondition: the date is returned with the following format: YYYY-MM-DDTHH:MM:SS.***+00
     const dateF2B = date => {
        return date ? date+"T12:00:00.000+00" : new Date().toISOString().replace("Z", "+00");
     };

    return { addPositionToLevelboard, containsE, decimalCount, dateB2F, dateF2B };
};

export default LevelboardHelper;