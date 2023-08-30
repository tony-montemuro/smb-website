const SubmissionHelper = () => {
    /* ===== FUNCTIONS ===== */

    // FUNCTION 1: removeObsolete - given an array of submissions, remove all "obsolete" submissions before the
    // date
    // PRECONDITIONS (1 parameter):
    // 1.) submissions: an array of submission objects, sorted first by level id in ascending order, then profile id in ascending order
    // and finally, submission date in descending order. ALSO, this array should be filtered by tas BEFORE running this function!!
    // POSTCONDITIONS (1 possible outcome):
    // a copy of the array is returned, except that for each user on each level, only their most recent submission is included
    const removeObsolete = submissions => {
        const filteredSubmissions = [];
        const previous = { level: undefined, profile: undefined };
        for (let i = 0; i < submissions.length; i++) {
            const current = submissions[i];

            // if current level / profile does not match previous level / profile, push submission to filtered, & update previous
            if (current.level.id !== previous.level || current.profile.id !== previous.profile) {
                filteredSubmissions.push(current);
                previous.level = current.level.id;
                previous.profile = current.profile.id;
            }
        }

        return filteredSubmissions;
    };

    return { removeObsolete };
};

/* ===== EXPORTS ===== */
export default SubmissionHelper;