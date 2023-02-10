const FrontendHelper = () => {
    // FUNCTION 1: capitalize
    // Precondition: str is a string
    // Postcondition: str is returned with it's first letter capitalized
    const capitalize = str => {
        return str.charAt(0).toUpperCase()+str.slice(1);
    };

    // FUNCTION 2: cleanLevelName
    // PRECONDITION: takes string with following format:
    // word1_word2_..._(wordn)
    // POSTCONDITION: and transforms to following format:
    // Word1 Word2 ... (Wordn)
    const cleanLevelName = str => {
        const words = str.split("_");
        for (let i = 0; i < words.length; i++) {
            if (words[i][0] !== "(") {
                words[i] = words[i][0].toUpperCase()+words[i].substr(1) 
            } else {
                words[i] = words[i][0]+words[i][1].toUpperCase()+words[i].substr(2);
            }
        }
        return words.join(" ");
    };

    // FUNCTION 3: recordB2F
    // PRECONDITION (2 parameters): 
    // 1.) record is a float number with at most two decimal places, OR it is undefined
    // 2.) type is either "score" or "time"
    // POSTCONDITION (1 parameter):
    // if the type is time, we fix the number of decimal places to two. a string is returned in this case.
    // if the type is score, simply return record, a float.
    const recordB2F = (record, type) => {
        if (record && type === "time") {
            return record.toFixed(2);
        }
        return record;
    };

    return { capitalize, cleanLevelName, recordB2F };
};

export default FrontendHelper;