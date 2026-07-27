---
name: groom-ticket
description: Groom a Linear issue into the SMBElite "Standard Issue" template, researching the codebase to fill in the user story, context, surface area, acceptance criteria, and references. Use whenever the user asks to groom, flesh out, refine, or otherwise prepare a ticket or issue before work starts, including bare invocations such as "groom SMB-5" or "can you groom this ticket for me".
---

# Groom Ticket

Turn a thin Linear issue into one that can be picked up and worked without
further clarification. Grooming means research, not guesswork: every claim
written to the issue should be traceable to the codebase, the database, or
something the user said.

## Resolving the issue

The user usually names the issue ( ex: `SMB-5`). If they do not:

1. Check the current git branch. Linear branch names carry the identifier
(`smb-5-add-basic-claude-configuration-to-codebase`).
2. Otherwise, ask which issue to groom. Do not guess from recent activity.

All issues live in the `SMBElite` team (key `SMB`).

## Process

1. **Fetch** the issue with `get_issue`.
2. **Check the template** against the fetched issue before anything else.
See [Template](#template). A mismatch halts the groom.
3. **Read what is already there.** Existing content is authoritative. See
[Existing content](#existing-content) for how to preserve, expand, and tidy
it.
4. **Research the codebase** until the work is genuinely understood. See
[Research](#research) below.
5. **Resolve ambiguity.** If research surfaces multiple viable paths, or the
user story cannot be inferred from context, stop and ask before writing.
See [When to ask](#when-to-ask).
6. **Write** the groomed description and priority with `save_issue`.
7. **Report** what changed: the issue URL, a short summary of each section
added or expanded, and the priority set.

## Existing content

What the user already wrote is authoritative in meaning, not in phrasing.
Preserve every idea, and expand where research adds something.

Issues get captured quickly, so shorthand is common. Clean up a sentence when
it is a fragment, is missing a subject or a verb, or reads as a note to self
rather than as prose. Keep the original meaning fully intact and change
nothing beyond what grammar requires. A sentence that already reads well is
left verbatim, even when you would have phrased it differently.

Trust your own judgement on where that line falls. This is not something to
ask about.

Correct a claim only when research proves it wrong, and say so in the report
when you do.

## Research

Match the tools to the surface being groomed:

- **Frontend**: `Grep` and `Glob` for the components, hooks, and database
helpers involved. Read them before naming them.
- **Backend**: start with the Supabase MCP (`list_tables`, `list_migrations`,
`execute_sql`), and fall back to migration files under
`supabase/migrations/`, per the project's backend workflow.
- **History**: `git log` and `git blame` explain why something is the way it
is, which often belongs in Context.
- **External behavior**: if the issue references a library, tool, or service,
confirm the current version in `client/package.json` or `supabase/config.toml`
rather than assuming.

Verify every path before writing it into Surface Area. A file that does not
exist yet is fine, but mark it `(new)` so it does not read as a mistake.

## Template

The source of truth is the `Standard Issue` template in Linear, not this file.
The Linear MCP cannot read templates, so what follows is a local mirror, and
mirrors go stale. Treat it as a cached copy to be verified, never as the
authority.

### Verify before grooming

Every issue created from `Standard Issue` carries the template's headings, so
the fetched issue is itself evidence of what the template currently looks
like. Compare its headings against the mirror below: same headings, same
wording, same order.

If they match, groom normally.

If they differ in any way, a heading added, removed, renamed, or reordered,
**stop immediately**. Do not write anything to Linear. Report the exact
difference and ask whether the template changed and this file should be
updated to match. Update the mirror first if so, then resume the groom.

An already-groomed issue is the one ambiguous case, since its headings may
have drifted through ordinary editing rather than a template change. Stop and
ask there too, but say which of the two you believe it is and why.

### Mirror

Reproduce this structure exactly, in this order, with all five headings
present even when a section is short:

```markdown
## User Story

## Context

## Surface Area

## Acceptance Criteria

- [ ]

## References
```

### User Story

Three lines, with the connectives bolded exactly as shown:

```markdown
**As a** <role>,
**I want** <capability>,
**so that** <benefit>.
```

Pick the role the work actually serves. For this codebase that is usually a
player submitting or browsing runs, a moderator reviewing submissions, a site
administrator, or a maintainer working on the project itself. Infrastructure
and tooling work serves the maintainer; say so plainly rather than inventing
an end-user benefit that does not exist.

Write this section even when the user left it blank. That is the section they
most want help with. If the role or benefit is genuinely not inferable, ask.

### Context

Why this work exists and what a person needs to know before starting: the
current behavior, the problem with it, and any constraint that shapes the
solution. Include findings from research that would otherwise have to be
rediscovered, and keep whatever the user already wrote.

This is prose, not a task list. Do not restate the acceptance criteria here.

### Surface Area

A bullet list of the files and directories the work is expected to touch,
each in backticks. Directories are fine when the change is broad
(`client/src/database/`). Mark files that do not exist yet as `(new)`.

The point is to bound the change, so keep the list to what the work actually
reaches. If research cannot narrow it down, say what is uncertain instead of
padding the list.

### Acceptance Criteria

Unchecked checkboxes (`- [ ]`), each an observable outcome that can be
verified when the work is done. Prefer outcomes over steps: what is true
afterward, not which function to edit.

Leave every box unchecked, including on a re-groom. Tracking progress is the
user's call, not the skill's.

### References

Bullet list of links: documentation, upstream issues, related Linear issues.
Never drop a link the user already added. Add links only when they were
genuinely useful during research; an empty References section is better than
a padded one.

## Priority

Set Linear priority alongside the description:

- **1 (Urgent)**: production is broken, or data integrity is at risk.
- **2 (High)**: blocks other planned work, or a user-facing bug.
- **3 (Medium)**: planned improvement with a clear reason to happen soon.
- **4 (Low)**: nice to have, no pressure.

Default to Medium when the signal is weak. If the user has already set a
priority other than "No priority", leave it alone; they made that call
deliberately. Always state the priority you set in your report so it is easy
to override.

Do not touch status, assignee, project, labels, or estimate.

## When to ask

Ask before writing, not after, when:

- Research surfaces multiple viable approaches with real trade-offs, for
example migrating an RPC to an Edge Function versus rewriting it in plain
SQL. Present the options with a recommendation and let the user choose. The
chosen path belongs in Context.
- The user story cannot be inferred from the issue or the codebase.
- Research contradicts something the issue asserts, and the correction would
change the scope of the work.

Do not ask about phrasing within a section, or anything the template already
settles. Template drift is the one structural exception, and it halts the
groom outright rather than merely prompting a question: see
[Template](#template).

## Disclaimer

Every groomed issue ends with this, after a horizontal rule:

```markdown
---

*Issue groomed by Claude; please review before starting.*
```

The wording is fixed. Keep exactly one disclaimer on an issue: when
re-grooming, replace the existing one rather than appending a second.
