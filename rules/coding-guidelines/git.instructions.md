---
description: Git, commit, PR, and changeset conventions for this repo
applyTo: "**"
alwaysApply: false
---

# Git Rules

## Pull requests

- One PR per change (feature, fix, or refactor). Never combine unrelated tasks (e.g. bugfix + new feature) in one PR, not even as a separate commit. Open a follow-up PR instead.
- Keep PRs as small as possible. Avoid unnecessary new dependencies.
- Don't write in the PR description what the reader can get from the diff: no code copied from it, no account of how the code changes. A usage example of a new API is fine.

## Commits

- Write commit messages in English, in the imperative, starting with a capital letter: `Add margin to footer` (not `Added margin` or `fix`).
- Explain **what** and **why**, not **how**: `Add margin to nav items to prevent them from overlapping the logo`.
- Don't write in the commit body what the reader can get from the diff: no code copied from it, no account of how the code changes. A usage example of a new API is fine.
- Never leave vague messages like `fix`, `polish`, `wip`, `another try` in a branch that is merged without squashing.
- Put codemod or CRUD-generator output in its own commit so reviewers can skip it.
- Don't split changes to `api`, `admin`, and `site` that belong to one change into separate commits.

## Branches

- Never start a branch name with `feature/`. That prefix is reserved for protected, long-lived feature branches, which are created in the GitLab UI. Target such a branch with a normal branch and a merge request.
