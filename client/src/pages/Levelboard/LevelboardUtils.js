/* ===== IMPORTS ===== */
import { GameContext } from "../../utils/Contexts";
import { useContext } from "react";
import FrontendHelper from "../../helper/FrontendHelper";

const LevelboardUtils = () => {
    /* ===== CONTEXTS ===== */

    // game state from game context
    const { game } = useContext(GameContext);

    /* ===== FUNCTIONS ===== */

    // helper functions
    const { capitalize, dateB2F, recordB2F } = FrontendHelper();

    // FUNCTION 1: submission2Form ("submission to form")
    // PRECONDITIONS (5 parameters):
    // 1.) submission: a submission object, or undefined
    // 2.) type: a string, either "score" or "time"
    // 3.) levelName: a valid name of a level
    // 4.) category: a string representing a valid category
    // 5.) profile: a profile integer that belongs to some profile, or is null
    // POSTCONDITIONS (2 possible outcomes, 1 return):
    // if submission is defined, we use the information from this object to define the return object
    // if not, we set many of the form values to their default values
    // the object returned is compatible with the submission form
    const submission2Form = (submission, type, levelName, category, profileId) => {
        // if a submission exists, we can use the data to form our formData object
        if (submission) {
            const details = submission.details;
            return {
                record: recordB2F(details.record, type, submission.level.timer_type),
                score: submission.score,
                monkey_id: details.monkey.id,
                region_id: details.region.id,
                live: details.live,
                proof: details.proof,
                comment: details.comment ? details.comment : "",
                profile_id: parseInt(profileId),
                game_id: game.abb,
                level_id: levelName,
                category: category,
                submitted_at: dateB2F(details.submitted_at),
                message: ""
            };

        // if not, we can fill the object with default data values
        } else {
            return {
                record: "",
                hour: "",
                minute: "",
                second: "",
                centisecond: "",
                score: type === "score" ? true : false,
                monkey_id: game.monkey[0].id,
                region_id: game.region[0].id,
                live: true,
                proof: "",
                comment: "",
                profile_id: profileId,
                game_id: game.abb,
                level_id: levelName,
                category: category,
                submitted_at: dateB2F(),
                message: ""
            };
        }
    };

    // FUNCTION 2: genericRecordFieldChecks - given one of the various "record" fields, perform generic checks
    // PRECONDITIONS (1 parameter):
    // 1.) field: a string value representing one of the "record" fields (record, hour, minute, second, OR centisecond)
    // 2.) name: a string describing the name of the field (used in the error message)
    // POSTCONDITIONS (1 return, 2 possible outcomes):
    // if the record is determined to be invalid, return a string that contains the error message
    // if the record is determined to be valid, return undefined
    const genericRecordFieldChecks = (field, name) => {
        // first, let's check for invalid characters; specifically, the 'e' character
        if (field.includes("e")) {
            return `Invalid character detected in ${ name }. Please ensure submission has no letters.`;
        }

        // next, ensure the record is a positive value (if it exists)
        const fieldValue = parseFloat(field);
        if (fieldValue && fieldValue < 0) {
            return `${ name } must be positive.`;
        }

        // next, ensure the recod is an integer (if it exists)
        if (fieldValue && !Number.isInteger(fieldValue)) {
            return `${ name } cannot have any decimals.`;
        }

        return undefined;
    };

    // FUNCTION 3: validateRecord - given a record field and type, validate the record
    // PRECONDITIONS (2 parameters):
    // 1.) recordField: a string value representing the record of the submission
    // 2.) type: a string value, either "score" or "time"
    // POSTCONDITIONS (1 return, 2 possible outcomes):
    // if the record is determined to be invalid, return a string that contains the error message
    // if the record is determined to be valid, return undefined
    const validateRecord = (recordField, type) => {
        // first, validate that record field is non-null
        if (!recordField) {
            return `${ capitalize(type) } is required.`;
        }

        // validate that record is not too large. this is somewhat arbitrary, but will leave it at this value for now*
        const record = parseFloat(recordField);
        if (record > 2147483647) {
            return `${ capitalize(type) } is invalid.`;
        }

        // otherwise, return the result of genericFieldChecks
        return genericRecordFieldChecks(recordField, "Score");
    };

    // FUNCTION 4: validateHour - given the hour field & timerType, validate the hour field
    // PRECONDITIONS (2 parameters):
    // 1.) hourField: a string value representing the hours of the submission
    // 2.) timerType: a string representing the timer type of the chart, which has an influence on how to validate this field
    // POSTCONDITIONS (1 return, 2 possible outcomes):
    // if the field is determined to be valid, return undefined
    // if the field is determined to be invalid, return a string that contains the error message
    const validateHour = (hourField, timerType) => {
        // first, if the timerType is "hour", this field is required
        if (timerType === "hour" && !hourField) {
            return "Hours field is required.";
        }

        // next, ensure hourField is of reasonable size (relatively arbitrary, but the max integer value should suffice for now)*
        const hour = parseFloat(hourField);
        if (hour > 2147483647) {
            return "Hours is invalid.";
        }

        // otherwise, return the result of genericFieldChecks
        return genericRecordFieldChecks(hourField, "Hours");
    };

    // FUNCTION 5: validateMinute - given the minute field & timerType, validate the minute field
    // PRECONDITIONS (2 parameters):
    // 1.) minuteField: a string value representing the minutes of the submission
    // 2.) timerType: a string representing the timer type of the chart, which has an influence on how to validate this field
    // POSTCONDITIONS (1 return, 2 possible outcomes):
    // if the field is determined to be valid, return undefined
    // if the field is determined to be invalid, return a string that contains the error message
    const validateMinute = (minuteField, timerType) => {
        // first, if the timerType is "min", this field is required
        if (timerType === "min" && !minuteField) {
            return "Minutes field is required.";
        }

        // next, ensure minute field is of reasonable size (relatively arbitrary, but the max integer value should suffice for now)*
        const minute = parseFloat(minuteField);
        if (minute > 2147483647) {
            return "Minutes is invalid.";
        }

        // next, if the "min" is at the middle or end of the timerType, we need to set it's max value to 60
        if (["hour_min", "hour_min_sec", "hour_min_sec_csec"].includes(timerType) && minute >= 60) {
            return "Minutes cannot exceed the value 59.";
        }

        // otherwise, return the result of genericFieldChecks
        return genericRecordFieldChecks(minuteField, "Minutes");
    };

    // FUNCTION 6: validateSecond - given the second field & timerType, validate the second field
    // PRECONDITIONS (2 parameters):
    // 1.) secondField: a string value representing the seconds of the submission
    // 2.) timerType: a string representing the timer type of the chart, which has an influence on how to validate this field
    // POSTCONDITIONS (1 return, 2 possible outcomes):
    // if the field is determined to be valid, return undefined
    // if the field is determined to be invalid, return a string that contains the error message
    const validateSecond = (secondField, timerType) => {
        // first, if the timerType is "sec", this field is required
        if (timerType === "sec" && !secondField) {
            return "Seconds field is required.";
        }

        // next, ensure second field is of reasonable size (relatively arbitrary, but the max integer value should suffice for now)*
        const second = parseFloat(secondField);
        if (second > 2147483647) {
            return "Seconds is invalid.";
        }

        // next, if the "sec" is at the middle or end of the timerType, we need to set it's max value to 60
        if (["min_sec", "min_sec_csec", "hour_min_sec", "hour_min_sec_csec"].includes(timerType) && second >= 60) {
            return "Seconds cannot exceed the value 59.";
        }

        // otherwise, return the result of genericFieldChecks
        return genericRecordFieldChecks(secondField, "Seconds");
    };

    // FUNCTION 7: validateCentisecond - given the centisecond field & timerType, validate the centisecond field
    // PRECONDITIONS (2 parameters):
    // 1.) centisecondField: a string value representing the centiseconds of the submission
    // 2.) timerType: a string representing the timer type of the chart, which has an influence on how to validate this field
    // POSTCONDITIONS (1 return, 2 possible outcomes):
    // if the field is determined to be valid, return undefined
    // if the field is determined to be invalid, return a string that contains the error message
    const validateCentisecond = (centisecondField, timerType) => {
        // first, if the timerType is "csec", this field is required
        if (timerType === "csec" && !centisecondField) {
            return "Decimals are required.";
        }

        // next, ensure this field has a max value of 99
        const centisecond = parseFloat(centisecondField);
        if (centisecond > 99) {
            return "Decimals cannot exceed the value 99.";
        }

        // otherwise, return the result of genericFieldChecks
        return genericRecordFieldChecks(centisecondField, "Decimals");
    };

    // FUNCTION 8: recordToSeconds - function that takes the parts of the time submission (hour, minute, second, and centisecond)
    // and converts to a single float value in seconds
    // PRECONDITIONS (4 parameters):
    // 1.) hourField: a string value representing the hours of the submission
    // 2.) minuteField: a string value representing the minutes of the submission
    // 3.) secondField: a string value representing the seconds of the submission
    // 4.) centisecondField: a string value representing the centiseconds of the submission
    // POSTCONDITIONS (1 return, 1 possible outcome):
    // the parameters are used to compute the final time value in seconds, and this value is returned
    const recordToSeconds = (hourField, minuteField, secondField, centisecondField) => {
        // first, define our time float, and parse all inputs to their float value
        let time = 0;
        const hour = parseFloat(hourField), minute = parseFloat(minuteField), second = parseFloat(secondField), centisecond = parseFloat(centisecondField);

        // next, let's handle the hour parameter
        if (hour) {
            time += (hour*3600);
        }

        // next, let's handle the minute parameter
        if (minute) {
            time += (minute*60);
        }

        // next, let's handle the second parameter
        if (second) {
            time += second;
        }

        // finally, we handle the centisecond parameter
        if (centisecond) {
            time += (centisecond/100);
        }

        return time;
    };

    return {
        submission2Form, 
        validateRecord,
        validateHour,
        validateMinute,
        validateSecond,
        validateCentisecond,
        recordToSeconds
    };
};

/* ===== EXPORTS ===== */
export default LevelboardUtils;