# Issue tracker

- Tracker: `linear.app`
- Team: `SMBElite (SMB)`
- Epic kind: `project`
- Work kind: `issue`

## Template: project

```markdown
## About

## Scope

## Ideas

## Assumptions
```

## Template: issue

```markdown
## User Story

## Context

## Surface Area

## Implementation Plan

## Acceptance Criteria

- [ ]

## Assumptions

## References
```

## Guidance: issue

### User Story

Three lines, with the connectives bolded exactly as shown:

```markdown
**As a** <role>,
**I want** <capability>,
**so that** <benefit>.
```

Pick the role the work actually serves. In this codebase that is usually a
player submitting or browsing runs, a moderator reviewing submissions, a site
administrator, or a maintainer of SMBElite. Tooling and infrastructure work
serves the maintainer; say so plainly rather than inventing an end user benefit
that does not exist.

Write this section even when the item arrived without one.

### Context

Why this work exists, and what a person needs to know before starting: the
current behavior, the problem with it, and any constraint that shapes the
solution. Include the findings that would otherwise have to be rediscovered.

This is prose, not a task list. Do not restate the acceptance criteria here.

Context should never get too long, unless absolutely necessary. Try to keep
length to at most a few paragraphs.

### Surface Area

A bullet list of the files and directories the work is expected to touch, each
in backticks. A directory is fine when the change is broad
(`client/src/database/`). Mark a file that does not exist yet as `(new)`.

The point is to bound the change, so keep the list to what the work reaches. If
research cannot narrow it down, say what is uncertain instead of padding the
list.

### Implementation Plan

How the work gets done. The reader is an implementation agent, started fresh,
with no memory of the run that wrote this item, so this is usually the longest
section. It holds two things: the detail of the change, and the order of the
commits that deliver it.

**The detail.** Take each part of the work in turn, and say what changes and why
it changes that way:

- The approach chosen, and the ones rejected, with the reason
- The constraint that forces it: a database shape, an existing contract, a
deploy step, a limit of a library or of the tracker
- The pattern the codebase already uses for this kind of change, named by file,
so the new work matches it
- Where the change enters: the file, the function, the migration, the table
- The traps found during research, and what avoids each one
- The exact command, when it is not one a reader would guess

Prefer the reasoning that a reader cannot recover from the diff. Use sub
headings (`###`) when the work has several distinct parts, a table when the
material is a comparison or an inventory.

Stop short of the change itself: no code, no diffs, no function bodies. That
gives a test for every sentence. Too little, and the agent guesses. Too much,
and the item has become a patch.

**The commits.** Close the section with an ordered list of the commits the work
is expected to produce, one line each, in the title format of
`.claude/upsert-pr.md`:

```markdown
1. `CHORE: add issue tracker guidance file` - the artifact, with no behavior change
2. `MOD: point the pull request workflow at the new file` - the switch over
3. `CHORE: remove the superseded skills` - the cleanup
```

The project uses squash and merge, so every commit on the branch folds into one.
The list exists to keep each commit small and reviewable on its own, and to fix
the order when one step depends on another. Say what each commit contains, and
why it comes where it does; a step that could go anywhere needs no reason.

Name the verification that belongs to a step when it is not the default one:
`npm run lint` and `npm run format:check` from `client/` for frontend work, and
`deno fmt --check`, `deno lint`, and `deno task test` from `supabase/functions/`
for edge function work. Never run `deno fmt` from the repository root.

Where the plan cannot be fixed in advance, say which step is uncertain and what
decides it, rather than inventing a sequence.

### Acceptance Criteria

Unchecked checkboxes (`- [ ]`), each an observable outcome that can be verified
when the work is done. Prefer outcomes over steps: what is true afterward, not
which function to edit.

Leave every box unchecked. Tracking progress belongs to the human.

### Assumptions

One line per assumption, with the date it was first recorded and its current
status:

- `2026-08-02 (open): the export job can stay synchronous`
- `2026-08-02 (resolved: we move it to the queue): the export job can stay synchronous`

The log is history. Never wipe it, and never add a second copy of an assumption
that is already there in different words.

### References

A bullet list of links: documentation, upstream issues, related Linear issues.
Never drop a link a human added. Add a link only when it was genuinely useful
during research; an empty section beats a padded one.

## Guidance: project

### About

Why the project exists, in prose. Two to five sentences.

### Scope

What the project covers, and what it deliberately leaves to another project.
Name the other project when one exists.

### Ideas

A bullet list of the work the project expects to hold. Link the issues that
exist, and leave the rest as plain text until they do. Work that was completed
without a ticket can stay in the list, marked `(untracked, done)`.

### Assumptions

The same log form as the issue.

## Conventions

- **Titles are Title Case, with no trailing punctuation.** Code identifiers keep
their backticks, as in "Migrate `plv8` RPCs to Edge Functions".
- **Every issue belongs to a project.** Open a new project when the work groups a
theme that keeps producing issues, or when its surface area is large enough to
split. Otherwise add an issue to the project that already covers the theme.
- **Labels stay unset.** `Bug`, `Improvement`, and `Feature` exist in the
workspace, and no issue uses them. A planning skill never sets one.
- **Planning fields belong to the human.** Assignee, priority, estimate, cycle,
and due date are never set by a skill.
- **The templates above are the readable copy of the Linear templates.** The
workspace holds a `Standard Issue` template, and the MCP cannot read it, so the
two are kept in step by hand.
- **This is a solo project.** Do not write notes aimed at other developers.
