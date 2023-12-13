# [SMBElite](https://smbelite.net/)

A leaderboard website for games in SEGA's Super Monkey Ball series. Written in:
- [React](https://react.dev/): A JavaScript front-end library for building user interfaces
- [PostgreSQL](https://www.postgresql.org/): A powerful relational database database management system, hosted on [supabase](https://supabase.com/)

### Motivations

This application was created to address some of the issues past speedrun leaderboards for the series had. For example, [Cyberscore](https://cyberscore.me.uk/) was a leaderboard website used by the *Super Monkey Ball* community for many years, but was largely abandonded due to many of the issues, including:

1. The website is run by people largely outside the community, who on occasion approve cheated or fake runs, making the leaderboards inaccurate. The site operators are also quite difficult to reach, meaning these inaccuracies can last for many months before anything is done about it. The website's weak proof requirements certainly did not help.
2. The website's UI is overly complicated, making it overwhelming for new users. This has made newer player's reluctant to submit their runs to the website.
3. Most of the player base has largely stopped using the website (or never used it in the first place), making most of the leaderboards outdated.

There also exists Google Sheets that track the World Records for many of the *Super Monkey Ball* games, including:

- [SMB1/2/DX IL Records](https://docs.google.com/spreadsheets/d/1KoneeqJzheHFYapQ_JfyxL9sI0X8_BE7ZEVMZt0t0bI/edit?usp=sharing)
- [Custom Level Records](https://docs.google.com/spreadsheets/d/16c2cC1abxdVBIGS0ejiWzwTboMZrk65XO2Znj8iMaYo/edit?usp=sharing)
- [Banana Mania Records](https://docs.google.com/spreadsheets/d/1c-kcGuUMRJ6DRr08UyR6hD-gnf5P9rzCyKeQDgCHwKc/edit?usp=sharing)

While these sheets are a UI improvement to [Cyberscore](https://cyberscore.me.uk/), they introduce new problems, such as:

1. Less information is tracked on the spreadsheets, leading to record history being lost. Because of the limitations of a spreadsheet, for each level, a spreadsheet can only really track:

    - The world record high score / fast time
    - The set of players who have achieved the record
    - A single link to a video proof

    As a consequence of this, when a record is beaten, the old record is often lost to time. Also, without full leaderboards, the only thing newer players have to shoot for is World Records, which may lead them to only trying the most easy levels to compete on.
2. The leaderboards ability to stay up-to-date is bottlenecked by how active the spreadsheet administrators are. It is not uncommon for days, and sometimes weeks, to pass before the spreadsheets are updated.

With a modern UI, multiple tiers of permissions, ranking systems, and the ability to track every detail of every submission, the hope is that [SMBElite](https://smbelite.net/) will serve as the hub of competitive Monkey Ball for many years to come!