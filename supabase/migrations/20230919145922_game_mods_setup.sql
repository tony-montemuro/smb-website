CREATE TABLE game_profile (
    game text not null,
    profile integer not null,
    constraint game_profile_game_fkey foreign key (game) references game (abb),
    constraint game_profile_profile_fkey foreign key (profile) references profile (id),
    primary key (game, profile)
);

ALTER TABLE game_profile ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON game_profile
FOR SELECT
TO public
USING (true);