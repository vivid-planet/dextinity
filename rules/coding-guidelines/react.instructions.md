---
description: React component, prop, state, fragment, and anti-pattern rules
applyTo: "**/*.ts,**/*.tsx"
paths:
    - "**/*.{ts,tsx}"
globs:
    - "**/*.{ts,tsx}"
alwaysApply: false
---

# React Rules

## General

- Function components only — no class components.
- Always write JSX. `React.createElement` is only for app initialization.
- Children are typed via `PropsWithChildren`, not an explicit `children: ReactNode` field.
- Inject services / API clients via **Context**, not module-level singletons.
- Folder structure: group by **feature/module**, not by type. Move things until it feels right; avoid top-level `components/`, `hooks/`, `utils/` dumping grounds.
- One "logical component" per file. Multiple sub-components in the same file are fine for structure/styling when they support the main export.

## Naming

- Components: **PascalCase**. Instances: **camelCase**. Import name must match the component name.
- File name must match the component name (`Footer.tsx` exports `Footer`). Exception: a file exporting multiple components.
- Prefer **meaningful file names** even inside a descriptive folder: `clients/ClientsTable.tsx`, not `clients/Table.tsx`.
- Private sibling files use the documented suffixes: `ClientsTable.sc.ts` (styled components), `ClientsTable.gql.ts` (GraphQL). **Never import `.sc.ts` / `.gql.ts` from another component.**

## Props

- Props are **camelCase**.
- Do not reuse DOM-attribute names (`className`, `hidden`, …) as custom-semantic props — pick a non-conflicting name (e.g. `variant`).
- Boolean flag props are optional (`hidden?: boolean`) with no default — they're falsy by default.
- Exception: a boolean that is the **controlled value** of a component (e.g. `checked` of a switch, `open` of a controlled dialog) is required (`checked: boolean`). Making it optional would let the component silently fall back to uncontrolled mode.
- When setting a boolean prop to `true`, omit the value: `<Foo hidden />`, not `<Foo hidden={true} />`.

## State

- `useState` pairs are `[value, setValue]` in camelCase: `const [userName, setUserName] = useState()`.

## Performance pitfalls

- **Never** define components, styled components, or stable helper functions _inside_ another component — they're re-created on every render. Hoist them to module scope.

    ```tsx
    // Bad
    const Foo = () => {
        const Wrapper = styled.div`…`;      // recreated every render
        const sortJobs = (a, b) => …;       // ditto
        return <Wrapper>…</Wrapper>;
    };

    // Good
    const Wrapper = styled.div`…`;
    const sortJobs = (a, b) => …;
    const Foo = () => <Wrapper>…</Wrapper>;
    ```

- Never use the array `index` as a React `key`. Use a stable id from the item (`todo.id`).

## Conditional rendering

- Do **not** use `cond && <X />` when `cond` is a number — React renders `0`. Compare explicitly (`arr.length > 0 && …`) or use a ternary (`arr.length ? <X /> : null`).

## SVGs

- Use `<svg><use href="/icon.svg#id" /></svg>` over importing SVGs as components. See [styling.instructions.md](styling.instructions.md#svgs).

## GraphQL — colocate fragments

A component that consumes GraphQL data must define its own fragment and be typed by that fragment. The parent query spreads the fragment. This way the child isn't coupled to the parent's query shape.

```tsx
// DisplayName.tsx
export const displayNameFragment = gql`
    fragment DisplayName on User {
        firstName
        lastName
    }
`;

function DisplayName({ user }: { user: GQLDisplayNameFragment }) {
    return (
        <>
            {user.firstName} {user.lastName}
        </>
    );
}

// UserDetail.tsx
const userDetailQuery = gql`
    query UserDetail($id: ID!) {
        user(id: $id) {
            ...DisplayName
        }
    }
    ${displayNameFragment}
`;
```

## General style

- Follow the official [React docs](https://react.dev/) for everything not covered here.
