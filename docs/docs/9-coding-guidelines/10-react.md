---
title: React
sidebar_position: -5
---

## General

- Follow the best practices described in the [official React documentation](https://react.dev/).
- Prefer Function Components over Class Components.
- Create one file per "logical component." Multiple Function Components per file are allowed for structuring, styling, etc.
- Always use JSX (use React's `createElement` only for app initialization).
- Use React's `PropsWithChildren` instead of defining children manually.
- Inject dependencies to services/APIs via Context.
- How to structure folders: "Move files around until it feels right."
  Recommendation: separate by modules instead of by type ([File Structure – React](https://legacy.reactjs.org/docs/faq-structure.html#grouping-by-features-or-routes)).

## Naming

### Casing

Use PascalCase for React components and camelCase for instances.

:::warning Bad

```tsx
import carCard from "./CarCard";
const CarItem = <CarCard />;
```

:::

:::tip Good

```tsx
import CarCard from "./CarCard";
const carItem = <CarCard />;
```

:::

### Naming components and their file

A component and its file should have the same name.

_The exception would be the rare case where a file exports multiple components._

:::warning Bad

```tsx title="src/components/Navigation.tsx"
export const Footer = () => {
    // ...
};
```

:::

:::tip Good

```tsx title="src/components/Footer.tsx"
export const Footer = () => {
    // ...
};
```

:::

### File names

Prefer meaningful file names over short, generic ones, even when the files are already in a descriptive folder.

:::warning Bad

```
clients/Table.tsx
clients/Table.sc.ts
clients/Table.gql.ts
```

:::

:::tip Good

```
clients/ClientsTable.tsx
clients/ClientsTable.sc.ts
clients/ClientsTable.gql.ts
```

:::

### Prop naming

- Name props in camelCase.
- Do not name props after DOM attributes.

:::warning Bad

```ts
type FooProps = {
    phone_number: number;
    UserName: string;
};
```

```ts
type BarProps = {
    className?: "default" | "fancy";
};
```

:::

:::tip Good

```ts
type FooProps = {
    phoneNumber: number;
    userName: string;
};
```

```ts
type BarProps = {
    variant?: "default" | "fancy";
};
```

:::

## Defining boolean props

Boolean props should generally be optional and not have a default value, as they are falsy by default.

:::warning Bad

```tsx
type FooProps = {
    hidden: boolean;
};
```

```tsx
const Bar = ({ hidden = false }: BarProps) => {
    if (hidden) {
        // ...
    }
    // ...
};
```

:::

:::tip Good

```tsx
type BazProps = {
    hidden?: boolean;
};

const Baz = ({ hidden }: BazProps) => {
    if (hidden) {
        // ...
    }
    // ...
};
```

:::

## Using boolean props

To set a prop to true, simply add the prop, without a value.

:::warning Bad

```tsx
<Foo hidden={true} />
```

:::

:::tip Good

```tsx
<Foo hidden />
```

:::

## React states

Name the state value in camelCase, and the setter function as the value name prefixed with "set", also in camelCase.

:::warning Bad

```tsx
const [UserName, setName] = useState();
```

:::

:::tip Good

```tsx
const [userName, setUserName] = useState();
```

:::

## Recommendations

- If a component becomes too complex:
    - Move GraphQL and styled components into separate files with `.gql.ts` and `.sc.ts` extensions.  
      :::caution  
      These files should be treated as **private** and must **not** be imported from other files.  
      :::
    - Split the component into smaller sub-components.
- Use `parameter?: type` instead of `parameter: type | undefined`, otherwise `parameter = undefined` must be explicitly set.

## Working with SVGs

If possible, use SVGs inline with `<use>`.

It is important that the SVG file contains an `id`, which is then referenced via the hash parameter in the path.

**You can use it like this:**

:::tip Good

```tsx
<svg>
    <use href="/icon.svg#custom-id"></use>
</svg>
```

:::

**SVG File:**
:::tip Good

```tsx
<svg viewBox="0 0 24 24" id="custom-id" version="1.1" xmlns="http://www.w3.org/2000/svg">
    <title>icon</title>
    <polygon
        fill="currentColor"
        points="12.661 11.954 17.904 6.707 17.198 6 11.954 11.247 6.707 6.003 6 6.71 11.247 11.954 6.003 17.2 6.71 17.907 11.954 12.661 17.2 17.904 17.907 17.198"
    ></polygon>
</svg>
```

:::

:::warning Bad

```tsx
import Icon from "../assets/icon.svg"

...

<Icon />
```

:::

:::warning Bad

```tsx
<img src="/icon.svg" />
```

:::

**Background:** SVGs imported as modules end up in the JS bundle, which increases download and compile time. Additionally, when used as `<img>` tags, they cannot be manipulated (e.g., changing path color).

## Common Bugs

:::info
These are common pitfalls, not strict rules that must always be followed.
:::

### Avoid array index as `key`

Use a unique identifier as the key, such as the item's `id`.

Explanation: [Index as a key is considered an anti-pattern](https://robinpokorny.medium.com/index-as-a-key-is-an-anti-pattern-e0349aece318)

:::warning Bad

```tsx
{
    todos.map((todo, index) => <Todo {...todo} key={index} />);
}
```

:::

:::tip Good

```tsx
{
    todos.map((todo) => <Todo {...todo} key={todo.id} />);
}
```

:::

### Conditional rendering

Don't use the `&&` syntax when rendering, depending on a number. The value `0` will be rendered by React.

Instead, compare the value to 0 or use the ternary operator (`? :`).

See React docs: [Conditional Rendering](https://react.dev/learn/conditional-rendering#logical-and-operator-)

:::warning Bad

```tsx
export const PostDetails = ({ post }) => (
    <>
        <PostContent />
        {post.comments.length && <PostComments comments={post.comments} />}
    </>
);
```

:::

:::tip Good

```tsx
export const PostDetails = ({ post }) => (
    <>
        <PostContent />
        {post.comments.length > 0 && <PostComments comments={post.comments} />}
    </>
);
```

```tsx
export const PostDetails = ({ post }) => (
    <>
        <PostContent />
        {post.comments.length ? <PostComments comments={post.comments} /> : null}
    </>
);
```

:::

## Common Anti-Patterns

Components or functions declared as constants inside a component are recreated on every render.
:::warning Bad

```tsx
const Foo = (jobs) => {
    const sortJobs = (a: Job, b: Job) => {
        return a.createdAt - b.createdAt;
    };

    const Wrapper = styled.div`...`;

    return <Wrapper>...</Wrapper>;
};
```

:::

**Explanation:** They are recreated on every render and can lead to performance issues. (See also [Hooks API Reference – React](https://legacy.reactjs.org/docs/hooks-reference.html#usecallback))

:::tip Good

```tsx
const sortJobs = (a: Job, b: Job) => {
    return a.createdAt - b.createdAt;
};

const Wrapper = styled.div`...`;

const Foo = (jobs) => {
    return <Wrapper>...</Wrapper>;
};
```

:::

## GraphQL

Use a fragment to define the required data of a component (see [Colocating Fragments](https://www.apollographql.com/docs/react/data/fragments#colocating-fragments))

:::warning Bad

```tsx title="DisplayName.tsx"
function DisplayName({
    user: { firstName, lastName }: GQLUserDetailQuery,
}) {
    return <>{firstName} {lastName}</>
}
```

```tsx title="UserDetail.tsx"
const userDetailQuery = gql`
    query UserDetail($id: ID!) {
        user(id: $id) {
            firstName
            lastName
        }
    }
`;

function UserDetail({ id }: { id: string }) {
    const user = useQuery(userDetailQuery);
    // ...
    return (
        <>
            <DisplayName user={user} />
            {/* ... */}
        </>
    );
}
```

:::

:::tip Good

```tsx title="DisplayName.tsx"
export const displayNameFragment = gql`
    fragment DisplayName on User {
        firstName
        lastName
    }
`;

function DisplayName({
    user: { firstName, lastName }: { user: GQLDisplayNameFragment },
}): JSX.Element {
    return <>{firstName} {lastName}</>;
}
```

```tsx title="UserDetail.tsx"
const userDetailQuery = gql`
    query UserDetail($id: ID!) {
        user(id: $id) {
            ...DisplayName
        }
    }
    ${displayNameFragment}
`;

function UserDetail({ id }: { id: string }) {
    const user = useQuery(userDetailQuery);
    // ...
    return (
        <>
            <DisplayName user={user} />
            {/* ... */}
        </>
    );
}
```

:::

**Explanation:** The child component should define for itself which fields of a GraphQL object it needs (and not rely on the parent component’s query!). This way,
the child component is not directly affected by changes in the parent query, for example if a field is no longer queried.

## Further reading / sources:

- [React documentation](https://react.dev/)
- [Hello World - React](https://legacy.reactjs.org/docs/hello-world.html)
- [TypeScript and React](https://fettblog.eu/typescript-react/)
