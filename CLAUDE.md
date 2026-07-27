## Introduction

[SMBElite](https://smbelite.net/) is a leaderboard website for games in SEGA's 
Super Monkey Ball series. This project consists primarily of two technologies:

1. React
2. PostgreSQL, hosted on Supabase

## General Workflows

- This codebase attempts to be as consistent as possible. Thus, follow patterns
established by the codebase: documentation style, code organization, commit
message style, etc.
- When working through a task, follow a **squash and merge** workflow: keep
commits small, enabling more efficient review. Remember, individual commits
will get folded into an overall commit for the whole task.
- When making a change that will impact the developer experience, consider
if the change needs to be documented in the project's `README.md` file, or if
the `init.sh` script needs to be updated.

## Frontend Workflows 

- Before a task is deemed as complete, always verify the codebase is linted
and formatted by running these commands from the `client/` directory:

```
npm run lint
npm run format:check
```

Fix any issues that arise before completion.
- Restrict all uses of the Supabase client to `client/src/database/` directory.
- Components that are scoped to a single web page should be defined alongside
the relevant page (`client/src/pages/{page}/`). Otherwise, define in
`client/src/components/` directory.

## Backend Workflows

- Information about the Supabase backend is primarily represented via migration
files. Thus, when retrieving information, start with the Supabase MCP, and 
fallback to migration files; the MCP should simplify information access.

