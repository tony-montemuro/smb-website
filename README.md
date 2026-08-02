# [SMBElite](https://smbelite.net/)

A leaderboard website for games in SEGA's Super Monkey Ball series. Written in:
- [React](https://react.dev/): A JavaScript front-end library for building user interfaces
- [PostgreSQL](https://www.postgresql.org/): A powerful relational database database management system, hosted on [Supabase](https://supabase.com/)

## Motivations

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

## Running Locally

If you would like to make contributions to this website, you will need to be able to run the application in a local developer environment. This includes both [server](#server-setup) and [client](#client-setup) code. The following steps should help you get up and running.

Before you can get started, you will need to clone the repository to your machine. Navigate to your working directory, and run this command:

```bash
git clone https://github.com/tony-montemuro/smb-website.git
```

Once this has finished, run:

```bash
cd smb-website
```

Optionally, run the following command, so that `git blame` skips the commit that reformatted the entire codebase with Prettier:

```bash
git config blame.ignoreRevsFile .git-blame-ignore-revs
```

GitHub's blame view already ignores this commit, so the command only affects `git blame` run locally.

From here, there are two ways to proceed:

1. **Automatic setup**: Run a bash script, which should get you up and running in a few minutes!
2. **Manual setup**: Perform each step manually (not recommended, but you *will* better understand development environment pitfalls this way)

### Automatic setup

To run the setup script, ensure you have the following software installed:

- [Supabase CLI](https://supabase.com/docs/guides/cli/getting-started)
- [Docker](https://docs.docker.com/get-docker/)
- [Node.js](https://nodejs.org/en)

Then, run the following command:

```bash
./init.sh
```

And you are done! Note that the local stack serves the [edge functions](#edge-functions) as well, so there is nothing extra to start.

### Manual setup

#### [Server Setup](#server-setup)

**Note:** Before you begin, you must have the following software installed:

- [Supabase CLI](https://supabase.com/docs/guides/cli/getting-started)
- [Docker](https://docs.docker.com/get-docker/)
- [Deno](https://docs.deno.com/runtime/getting_started/installation/) (optional): only needed for [edge functions](#edge-functions) development

Before you can run the app, a local database server must be running for the client to connect to. Here are the steps you must follow:

1. Ensure the Docker daemon is running on your machine.
2. Run the following command:

    ```bash
    supabase start
    ```
    Please do keep in mind that this command may take several minutes to complete. Once this command does complete, the server should be up and running!
3. Run the following command:
    ```bash
    supabase status
    ```
    This command will display information about your local development server instance. Make note of the `Project URL` and `Publishable` parameters.
4. Run these commands:
    ```bash
    cd client
    touch .env.development.local
    ```
    This will create a file in the `client` directory for storing environment variables, which are necessary to connect to the server.
5. Open `.env.development.local` into a text editor, add the following, and save:
    ```env
    VITE_APP_SUPABASE_URL=<YOUR_PROJECT_URL>
    VITE_APP_SUPABASE_PUBLISHABLE_KEY=<YOUR_PUBLISHABLE_KEY>
    ```
    Replacing `<YOUR_PROJECT_URL>` and `<YOUR_PUBLISHABLE_KEY>` with `Project URL` and `Publishable` respectively from the `supabase status` command in step 3.

This is what is *required* for setting up the server. The following information is nice to have, but not a necessity. If you just want to set up the client application, skip to the [client](#client-setup) section.

##### Supabase Studio

The Supabase CLI provides an easy way to access a GUI interface of the database. To do this, run:
```bash
supabase status
```
Copy the `Studio URL` parameter, and paste it into your browser. It should open to a page that looks like this:
![Supabase Studio](https://i.imgur.com/VLLSejw.png)
This is an easy way to interface with the database.

##### [Edge Functions](#edge-functions)

`supabase start` serves edge functions at `<YOUR_PROJECT_URL>/functions/v1/<function-name>`; no separate step is necessary to run them.

While iterating on a function, this command is worth running in a second terminal, as it adds hot reload and streams the logs of each request:

```bash
supabase functions serve
```

Edge functions are written in TypeScript, and run on Deno rather than Node.js. With Deno installed, run these from the `supabase/functions` directory:

```bash
deno fmt --check
deno lint
deno task test
```

**Important:** Take care to run them from `supabase/functions`, and not from the root directory: `deno fmt` would otherwise reformat the frontend code, which Prettier owns.

##### Adding Game Box Art

This is a totally optional thing, but included in the repository are box art for some of the games within the `seed` data. To upload the box art to your local server:
1. Starting in the root directory, navigate to the `supabase` directory by running:
    ```bash
    cd supabase
    ```

2. The node script in step 4 requires the installation of an `npm` package, so run:
    ```bash
    npm i
    ```
    To install it.

3. Then, run:
    ```bash
    supabase status
    ```
    Make note of the `Project URL` and `Secret` parameters.

4. Finally, run:
    ```bash
    node upload_images.js <YOUR_PROJECT_URL> <YOUR_SECRET_KEY>
    ```
    Replacing `<YOUR_PROJECT_URL>` and `<YOUR_SECRET_KEY>` with `Project URL` and `Secret` respectively.

Note that this process can sometimes not work properly; the local supabase storage system can be finicky. If this does not work, it is safe to ignore this section.

#### [Client Setup](#client-setup)

**Note:** Before you begin, you must have the following software installed:

- [Node.js](https://nodejs.org/en)

Once you have the local server setup, running the application is relatively straightforward. Here's how:

1. Starting in the root directory, navigate to the client directory by running:
    ```bash
    cd client
    ```
2. The application code is dependent on a number of `npm` packages. To install them, run:
    ```
    npm i
    ```
    Note that this could take up to several minutes to complete.
3. Finally, to run the application, run:
    ```bash
    npm start
    ```
    This command will initiate the client development server, and should automatically open the application in your default browser. If for whatever reason this does not happen, you can access the application by going to:
    ```
    http://localhost:3000
    ```

### Claude Code

This codebase is configured to work with [Claude Code](https://claude.com/claude-code).

The repository checks in a `.mcp.json` that registers the [Supabase MCP server](https://supabase.com/docs/guides/ai-tools/mcp), which lets Claude Code inspect the database schema, migrations, and logs directly. It holds no credentials, so there is nothing to configure after cloning.

The server is reached over HTTP at the local API port (`8081`, set by `[api]` in `supabase/config.toml`), so it only resolves while the local Supabase stack is running. If Claude Code reports the `supabase` server as failed, the stack is almost certainly stopped. Start it with:

```bash
supabase start
```

Then restart Claude Code, or reconnect the server with `/mcp`.
