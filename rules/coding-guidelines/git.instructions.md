---
description: Git, commit, PR, and changeset conventions for this repo
applyTo: "**"
alwaysApply: false
---

# Git Rules

## Pull requests

- One PR per change (feature, fix, or refactor). Never combine unrelated tasks (e.g. bugfix + new feature) in one PR.
- Do **not** include an unrelated bugfix in a feature PR, even as a separate commit. Open a follow-up PR instead.
- Changes to `api`, `admin`, and `site` in the same PR should **not** be split into separate commits.
- Keep PRs as small as possible. Avoid unnecessary new dependencies.
- Don't write in the PR description what the reader can get from the diff: no code copied from it, no account of how the code changes. A usage example of a new API is fine.
- If the `main` pipeline is red, do not merge anything that does not contribute to fixing it.

## Commits

- Write commit messages in English, in the imperative, starting with a capital letter: `Add margin to footer` (not `Added margin` or `fix`).
- Explain **what** and **why**, not **how**: `Add margin to nav items to prevent them from overlapping the logo`.
- Don't write in the commit body what the reader can get from the diff: no code copied from it, no account of how the code changes. A usage example of a new API is fine.
- Never use vague messages like `fix`, `polish`, `wip`, `another try` in the final history — clean them up before merging.
- Commits should be **atomic**: each commit leaves the code in a runnable state.
- Prefer multiple small commits split by logical change (e.g. separate docs from feature work).
- Exception: codemod / CRUD-generator output belongs in its own commit so reviewers can skip it.
- Multi-line commit messages are preferred over MR-description-only explanations — the info stays in Git and shows up in IDE tools.

## Branches & merging

- Trunk-based development — PRs target `main` (minor/patch) or `next` (breaking).
- Squash-merge is the default. If commit history is messy it **must** be squashed.
- Feature branches (name prefix `feature/…`) are protected — resolve conflicts by merging main into a new branch and opening a fresh MR; never squash-merge a feature branch.
- Cherry-picking into production is only allowed for commits already on `main`.

## Review etiquette

- Reviewers resolve concerns (except obvious typos). A PR merges only when all concerns are resolved and all reviewers approved.
- `OPT:` / `Note:` / `Nit:` prefix optional suggestions.
