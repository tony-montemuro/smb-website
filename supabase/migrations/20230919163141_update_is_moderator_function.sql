CREATE FUNCTION is_moderator(abb text)
RETURNS boolean
LANGUAGE sql
AS $$
    SELECT (
        is_admin() OR EXISTS (
            SELECT 1
            FROM game_profile
            WHERE profile = get_profile_id() AND game = abb
        )
    )
$$;

DROP POLICY "Enable restricted approvals for moderators" ON approve;

CREATE POLICY "Enable restricted approvals for moderators"
ON approve
FOR INSERT
TO authenticated
WITH CHECK (
   (is_moderator((SELECT submission.game_id FROM submission WHERE (submission.id = approve.submission_id))) 
   AND 
   (NOT report_exists(submission_id)))
);

DROP POLICY "Enable insert for moderators" ON notification;

CREATE POLICY "Enable insert for moderators"
ON notification
FOR INSERT
TO authenticated
WITH CHECK (
   is_moderator(game_id)
);

DROP POLICY "Enable insert for moderators" ON post;

CREATE POLICY "Enable insert for administrators"
ON post
FOR INSERT
TO authenticated
WITH CHECK (
    (is_admin())
    AND
    (profile_id = (get_profile_id()))
    AND
    (posted_at = NOW())
);

DROP POLICY "Enable delete for moderators who are unrelated to the report" ON report;

CREATE POLICY "Enable delete for moderators who are unrelated to the report"
ON report
FOR DELETE
TO authenticated
USING (
    (is_moderator((SELECT submission.game_id FROM submission WHERE submission.id = report.submission_id)))
    AND
    (creator_id <> get_profile_id())
    AND
    ((SELECT submission.profile_id FROM submission WHERE (submission.id = report.submission_id)) <> get_profile_id())
);

DROP POLICY "Enable insert for moderators" ON submission;

CREATE POLICY "Enable insert for moderators"
ON submission
FOR INSERT
TO authenticated
WITH CHECK (
    is_moderator(game_id)
);

DROP POLICY "Enable mod delete for unapproved/irrelevant report submissions" ON submission;

CREATE POLICY "Enable mod delete for unapproved/irrelevant report submissions"
ON submission
FOR DELETE
TO authenticated
USING (
    (is_moderator(game_id))
    AND (
        NOT (
            EXISTS ( 
                SELECT 1
                FROM approve
                WHERE (approve.submission_id = submission.id)
            )
        )
    ) 
    AND (
        NOT (
            EXISTS (
                SELECT 1
                FROM report
                WHERE ((report.submission_id = submission.id) AND (report.creator_id = get_profile_id()))
            )
        )
    ) 
    AND (
        NOT ((
                EXISTS (
                    SELECT 1
                    FROM report
                    WHERE (report.submission_id = submission.id)
                )
            ) AND (
                profile_id = get_profile_id()
            )
        )
    )
);

DROP POLICY "Enable mod updates for unapproved submissions" ON submission;

CREATE POLICY "Enable mod updates for unapproved submissions"
ON submission
FOR UPDATE
TO authenticated
USING (
    (is_moderator(game_id)) 
    AND 
    (
        NOT (
            EXISTS (
                SELECT 1
                FROM approve
                WHERE (approve.submission_id = submission.id)
            )
        )
    )
)
WITH CHECK (
    (is_moderator(game_id)) 
    AND 
    (
        NOT (
            EXISTS (
                SELECT 1
                FROM approve
                WHERE (approve.submission_id = submission.id)
            )
        )
    )
);

DROP FUNCTION IF EXISTS is_moderator();