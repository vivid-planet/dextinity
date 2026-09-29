# GitHub Copilot Review Instructions

Do not create a pull request summary.

## Coding Guidelines

Follow the coding guidelines at https://cms-docs.dextinity.com/docs/coding-guidelines/. The most important rules are summarized below.

### General

- Use descriptive naming. Avoid non-obvious abbreviations (exceptions: obvious, conventional abbreviations whose meaning is unambiguous in context such as `i` for an index, well-known abbreviations such as HTML, CSS, API, …, or abbreviations from a 3rd party).
- Name booleans with a prefix (is/has/should, e.g., `isLoading`, `hasError`).
- Name variables in affirmative form (avoid negative naming, e.g., use `isComplete` instead of `isNotComplete`).
- Don't use exceptions as flow control.

### TypeScript

- Prefer using an options object instead of multiple parameters.
- Use named exports only (default exports are allowed only if technically required).
- Prefer async/await over callbacks.
- Prefer `for...of` loops.
- Use default arguments instead of short-circuiting or conditional logic.
- Enum keys and values must be identical.

### React

- Prefer Function Components over Class Components.
- Create one file per "logical component."
- Use PascalCase for React components and camelCase for instances.
- A component and its file should have the same name.
- Name props in camelCase.
- Boolean props should generally be optional and not have a default value.
- Avoid using array index as `key` in lists; use a unique identifier instead.
- Don't use the `&&` syntax for conditional rendering when depending on a number; use `> 0` or the ternary operator instead.
- Don't define constants or components inside a component function (they are recreated on every render).
- Use fragments to define the required data of a component (colocating fragments).

### NestJS / API

- Only log warnings and errors by default.
- Services should be decoupled from the HTTP/GraphQL layer.
- Prefer passing the entire entity rather than just the ID.
- Use Dependency Injection (DI); prefer constructor-based injection.
- Avoid using `process.env` directly (except in entry points).
- Always use `columnType: text` for strings and `columnType: "timestamp with time zone"` for timestamps.
- Prefer `type: "uuid"` for IDs.
- Avoid DB defaults.

### CSS / Styling

- Use CSS Grid and Flexbox to align elements, but only when necessary.
- Use a mobile-first approach when styling.
- Avoid inline styles; use Emotion or Styled Components instead.
