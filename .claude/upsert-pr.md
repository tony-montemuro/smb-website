# Pull request guidance

## Base branch

`main`. The repository uses squash and merge, so the pull request title becomes
the commit message.

## Title

Format: `TYPE: subject`. The subject is lowercase, with no full stop at the
end.

| Prefix | Use for |
| --- | --- |
| `FIX:` | Corrects broken behavior. |
| `MOD:` | Changes existing behavior, configuration, or dependencies. |
| `FEATURE:` | Adds user-facing capability that did not exist. |
| `CHORE:` | Housekeeping that leaves application behavior unchanged. |

Never write `WIP:` in a title: it is an in-branch commit prefix. Never write a
trailing `(#58)`: GitHub appends the number at merge time.

To see how the project applies these prefixes:
`git log main --format='%s' | grep -E '\(#[0-9]+\)$'`

## Issue tracker

Linear. The branch name carries the identifier, so `smb-5-add-claude-md` means
`SMB-5`. Confirm the issue with the Linear MCP `get_issue`, and link the URL it
returns. Do not assemble the URL by hand. Delete the "Linear issue" section
when the branch name has no identifier.

The Linear issue is often the best source for why the change exists.

## Verification

Frontend work runs from `client/`:

```bash
npm run lint
npm run format:check
```

Edge function work runs from `supabase/functions/`:

```bash
deno fmt --check
deno lint
deno task test
```

Never run `deno fmt` from the repository root.

## Template notes

- **Screenshots.** You cannot produce these. Delete the section when nothing
user-visible changed. When the diff touches the UI, keep the heading, leave it
empty, and tell the user in your report that it is waiting on them.
- **Type of change.** Usually one box. Leave the rest as `- [ ]`.
- **Required follow up work.** Only follow ups that are real and already
identified, such as work this branch defers to a later pull request. Delete the
section otherwise.
