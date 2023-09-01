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

    // FUNCTION 2: getFilteredForRankings - function that performs the necessary filtering (and sorting) from a full list of
    // submission cache for ranking calculations
    // PRECONDITIONS (1 parameter): 
    // 1.) submissions: an array of submission objects, sorted first by level id in ascending order, then profile id in ascending order
    // and finally, submission date in descending order
    // POSTCONDITIONS (1 possible outcome):
    // a copy of the array is returned, except that for each user on each level, only their most recent, non-TAS submission is included
    // and sorted in ascending order by level id, in descending order by record, and finally, in ascending order by submitted_at
    const getFilteredForRankings = submissions => {
        // first, perform necessary filters
        const rta = submissions.filter(submission => !submission.tas);
        const filtered = removeObsolete(rta);

        // next, sort, and return
        filtered.sort((a, b) => {
            if (a.level.id !== b.level.id) {
                return a.level.id - b.level.id;
            }
			if (a.record !== b.record) {
				return b.record - a.record;
			}
			return a.submitted_at.localeCompare(b.submitted_at);
		});
        return filtered;
    };

    return { removeObsolete, getFilteredForRankings };
};

/* ===== EXPORTS ===== */
export default SubmissionHelper;