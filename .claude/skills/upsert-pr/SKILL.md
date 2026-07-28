---
name: upsert-pr
description: Create or update the draft pull request for the current branch, writing a body that follows the repository's PR template from the branch's diff against `main`. Use whenever the user asks to open, create, draft, or refresh a pull request, including bare invocations such as "open a PR" or "update the PR description".
---

# Upsert PR

Two halves of one job. If the current branch has no pull request, open one as
a draft. If it already has one, bring its description back in line with what
the branch now contains. Either way the body comes from the repository's PR
template, filled in from the diff against `main`.

The name is deliberate: running this twice on the same branch is expected, and
the second run must not undo the first.

## Preconditions

Check these first, and stop with a clear message if any fails:

- `gh auth status` succeeds. This skill drives GitHub exclusively through the
`gh` CLI.
- The current branch is not `main`. A pull request from `main` into `main` is
a mistake, not a request.
- `git log main..HEAD` is non-empty. With no commits of its own, the branch
has nothing to describe.

## Process

1. **Resolve the branch and any existing pull request.** Run
`gh pr view --json number,title,body,isDraft,url`. Success means update mode;
a "no pull requests found" error means create mode.
2. **Confirm the branch is on the remote.** See [Pushing](#pushing).
3. **Read the change.** See [Reading the change](#reading-the-change).
4. **Write the body** from the template. See [Body](#body).
5. **Create or update.** Create mode: `gh pr create --draft --base main`.
Update mode: `gh pr edit <number>`, leaving the title alone.
6. **Report** the pull request URL, its title, whether it was created or
updated, and every section you filled, deleted, or left for the user.

Always pass the body with `--body-file`, writing it to the scratchpad first.
Passing markdown through `--body` puts backticks, newlines, and `#` at the
mercy of the shell.

## Pushing

`gh pr create` needs the branch to exist on `origin`. When it does not, ask
the user before pushing. Pushing is outward-facing, so it is their call each
time, not a default.

Once they agree, prove SSH can authenticate before running the push, rather
than discovering it cannot:

```bash
git ls-remote origin HEAD
```

Exit 0 means the push will go through. Ask the remote rather than checking
`ssh-add -l`. The agent is one route to authentication, not authentication
itself; a key with no passphrase never appears there and works anyway.

A failure of `Permission denied (publickey)` means the key is not available to
this session. Do not give up, and do not treat it as a dead end. Stop and ask
the user to run exactly this:

```bash
ssh-add ~/.ssh/id_github
```

The passphrase prompt needs a TTY that this session does not have, so running
it here cannot work; the user has to. Wait for them to confirm, re-run the
probe, and carry on. Any other failure is an environment problem, and worth
reporting as it stands.

Never route around a failed push by rewriting the remote URL or reaching for a
different credential.

In update mode, local commits that are ahead of the remote produce a
description that does not match what a reviewer sees. Point that out and offer
to push rather than quietly describing work that is not there yet.

## Reading the change

Diff against the merge base with three dots, `git diff main...HEAD`, which is
what GitHub itself shows. Two dots compares against the current tip of `main`
and will attribute other people's commits to this branch.

Start with `--stat` for shape, then read the parts that the file names do not
already explain. Commit subjects are the strongest evidence of intent here,
since the project keeps commits small under squash and merge, so
`git log main..HEAD` is worth reading before the diff itself.

Describe the change, not the file list. A reviewer can see which files moved;
what they need from the body is what the branch does and why.

## Title

Only set a title in create mode. In update mode leave it alone unless the user
asks for it, since they may have edited it deliberately.

The format is `TYPE: subject`, with the subject in lowercase and no trailing
period. Squash and merge turns this into the commit message, which is why the
convention matters.

| Prefix | Use for |
| --- | --- |
| `FIX:` | Corrects broken behavior. |
| `MOD:` | Changes existing behavior, configuration, or dependencies. |
| `FEATURE:` | Adds user-facing capability that did not exist. |
| `CHORE:` | Housekeeping that leaves application behavior unchanged. |

The line between `MOD:` and `CHORE:` is judgement. Reconfiguring the ESLint
setup was `MOD:`; adding a pull request template was `CHORE:`. When unsure,
look at what the project actually did: `git log main --format='%s' | grep -E '\(#[0-9]+\)$'`
lists every squash-merged title.

Two things never belong in a title. `WIP:` is an in-branch commit prefix, not
a pull request prefix. A trailing `(#58)` is appended by GitHub at merge time,
so writing one by hand produces a duplicate.

## Body

Read `.github/pull_request_template.md` at run time and follow it exactly. It
is a file in this repository, so there is nothing to mirror and no excuse for
writing the sections from memory: the template changes, and a stale copy
produces a body that no longer matches what reviewers expect.

Replace each HTML comment with real content. Sections whose comment says
"Delete this section if not applicable" are genuinely deleted, heading and
comment together, when they do not apply; a bare heading over nothing is
noise.

Section by section:

- **Linear issue.** Linear branch names carry the identifier, so
`smb-5-add-claude-md` means `SMB-5`. Confirm the issue exists with the Linear
MCP `get_issue` and link the URL it returns rather than assembling one. Delete
the section when the branch name carries no identifier.
- **What changed / Why the change.** What the branch does, and the reason it
exists. The reason is rarely in the diff; look for it in the commit messages
and the Linear issue.
- **Type of change.** Check what applies, usually one box. Leave the rest as
`- [ ]`.
- **Screenshots.** You cannot produce these. Delete the section when nothing
user-visible changed. When the diff does touch the UI, keep the heading, leave
it empty, and tell the user in your report that it is waiting on them.
- **How was this tested?** Only what actually ran. For frontend work that
means `npm run lint` and `npm run format:check` from `client/`, per the
project's workflow; run them and report the result. Never write a verification
step that did not happen.
- **Required follow up work.** Only follow ups that are real and already
identified, such as a change this branch defers to a later pull request.
Delete the section otherwise.

## Update mode

The existing body is authoritative in meaning, not in phrasing. Read it before
writing anything, and treat your regenerated version as a proposal to merge
into it, not a replacement for it.

- Keep what the user wrote wherever the diff still supports it. A sentence
that already reads well stays verbatim, even when you would have phrased it
differently.
- Tidy shorthand. Descriptions get written quickly, so a section may hold a
fragment, or an idea that is missing a subject or a verb. Turn it into a
sentence, keeping the original meaning fully intact and changing nothing
beyond what grammar requires. Trust your judgement on where that line falls.
- Add sections the body is missing. A pull request opened before the template
grew will be short a heading or two.
- Add detail for commits that landed since the body was last written.
- Remove statements the diff no longer supports, and name each removal in your
report so the user can push back.
- Do not restore a section the user deleted unless the change now makes it
applicable, and say so in the report when you do.

Never run `gh pr ready`. Marking a pull request ready for review is the user's
decision, and this skill only ever works in draft.

## When to ask

Ask before acting, not after, when:

- The branch has no remote counterpart. See [Pushing](#pushing).
- The branch mixes changes with no common thread, which usually means it
should be more than one pull request. Say what you see and let the user decide
before you write a body that has to paper over it.
- The pull request targets a base other than `main`, or the user's request
implies one. Confirm the base rather than assuming.

Do not ask about wording within a section, which prefix to use, or anything
the template already settles.
