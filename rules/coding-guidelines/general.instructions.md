---
description: Language-agnostic naming, comment, and control-flow rules
applyTo: "**/*.ts,**/*.tsx,**/*.js,**/*.jsx,**/*.mjs,**/*.cjs"
paths:
    - "**/*.{ts,tsx,js,jsx,mjs,cjs}"
globs:
    - "**/*.{ts,tsx,js,jsx,mjs,cjs}"
alwaysApply: false
---

# General Rules (all languages)

## Naming

- Use descriptive names. A reader should understand intent without reading the implementation or a comment.
- Boolean names must read as a yes/no question or a flag. Prefer `is` / `has` / `should`; verb-phrase flags (`showFoo`, `hideFoo`, `canFoo`, `allowFoo`, `enableFoo`, `disableFoo`) and well-known adjectives (`loading`, `disabled`, `open`) are fine too, as is common in this codebase and MUI. Avoid names that read as a noun or an action (`scopeColumn`, `toggleScope`).
- Name booleans in the **affirmative**: `isComplete`, not `isNotComplete`. Negate at the use site with `!`.
- Avoid non-obvious abbreviations. Exceptions: obvious, conventional abbreviations whose meaning is unambiguous in context (e.g. `i` for an index, `id`, `ref`, `props`), widely-known protocols/acronyms (HTML, CSS, TCP, API, SSO…), and names dictated by third parties. When in doubt, spell it out.
- When an acronym appears in PascalCase / camelCase, treat it like a word: `GuiController`, `UiElement` — not `GUIController` / `UIElement`.

## Comments

- Write a comment only for what the code can't show, for instance why a workaround is necessary or a hidden constraint. Never repeat what the code does.
- Before you add a comment, try to make the code show it: rename a variable, extract a function, or replace a value with a named constant.
- Put a comment on the most specific code it explains: at the end of its line for a short note, directly above it for a longer one. Put it above a group only when it explains the group as a whole.

## Control flow

- **Never use exceptions for control flow.** Exceptions signal _exceptional_ situations; using them for expected branches hides real failures. Check preconditions explicitly (`if (!(await exists(id))) return undefined;`) instead of wrapping a `findOrFail` in try/catch.
