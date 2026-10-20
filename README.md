# project-compass

A Claude Code mod for a Firstmate home.
As you type a request, a line above the prompt shows which registered project it points at, so a misrouted request is visible before you send it.

- `→ acme-website` when one project clearly matches
- `? ambiguous: metrics / acme-website` when several match equally
- nothing when the draft gives no hint, starts with `/`, or is a single word

It reads `data/projects.md` from the session's working directory, so it only shows something when Claude Code runs in a Firstmate home.
A full project name is the strongest signal; a word from a project's description counts when it belongs to that project alone, and a word shared by two or three projects only makes a request ambiguous.
The list is re-read after every turn.

## Install

At the prompt of a Claude Code terminal session:

```
/plugin install project-compass --marketplace wtekimam/project-compass
```

Answer `y` to add the marketplace, then pick a scope.

From a shell:

```
claude plugin install project-compass --marketplace wtekimam/project-compass
```

## Test

```
claude plugin test .
```
