---
description: Language-agnostic naming and control-flow rules
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
- Prefer descriptive identifiers over explanatory comments — comments drift out of sync with the code.
- Boolean variables must read as booleans: prefix with `is` / `has` / `should` (exceptions: well-known flags like `loading`, `disabled`).
- Name booleans in the **affirmative**: `isComplete`, not `isNotComplete`. Negate at the use site with `!`.
- Avoid non-obvious abbreviations. Exceptions: obvious, conventional abbreviations whose meaning is unambiguous in context (e.g. `i` for an index, `id`, `ref`, `props`), widely-known protocols/acronyms (HTML, CSS, TCP, API, SSO…), and names dictated by third parties. When in doubt, spell it out.
- When an acronym appears in PascalCase / camelCase, treat it like a word: `GuiController`, `UiElement` — not `GUIController` / `UIElement`.

## Control flow

- **Never use exceptions for control flow.** Exceptions signal _exceptional_ situations; using them for expected branches hides real failures. Check preconditions explicitly (`if (!(await exists(id))) return undefined;`) instead of wrapping a `findOrFail` in try/catch.
