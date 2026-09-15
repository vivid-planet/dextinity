---
title: Typescript
sidebar_position: -5
---

Everything from [Clean Code concepts adapted for TypeScript](https://github.com/labs42io/clean-code-typescript)

## General

Prefer using an options object instead of multiple parameters
(Explanation: [Clean Code concepts adapted for TypeScript](https://github.com/labs42io/clean-code-typescript#function-arguments-2-or-fewer-ideally))

:::warning Bad

```ts
const getSortedJobs = (orderBy: string, includeSoftDeleted: boolean, limit: number): Job[] => {};

getSortedJobs("createdAt", true, 20);
```

:::

:::tip Good

```ts
const getSortedJobs = (options: {
    orderBy: string;
    includeSoftDeleted: boolean;
    limit: number;
}): Job[] => {};

getSortedJobs({
    orderBy: "createdAt",
    includeSoftDeleted: true,
    limit: 20,
});
```

:::

- Use named exports only (Exception: Default exports are allowed only if technically required)  
  **Reason:** They are harder to locate and refactor.

- Use relative imports only for sibling or child files within a module (for anything else, use imports via @src)

- Prefer async/await over callbacks

- Prefer for...of loops
  Supports all iterators, async/await, and control statements
  (See: [Should one use for-of or forEach when iterating through an array?](https://stackoverflow.com/questions/50844095/should-one-use-for-of-or-foreach-when-iterating-through-an-array/50844413#50844413))

- Use default arguments instead of short-circuiting or conditional logic

:::warning Bad

```ts
function createMicrobrewery(name) {
    const breweryName = name || "Hipster Brew Co.";
    // ...
}
```

:::

:::tip Good

```ts
function createMicrobrewery(name = "Hipster Brew Co.") {
    // ...
}
```

:::

## 3rd Party NPM packages

See [Libraries and Techniques](./libraries-and-techniques)

## Further Reading / Sources

- [Google TypeScript Style Guide](https://google.github.io/styleguide/tsguide.html)
- [Clean Code concepts adapted for TypeScript – GitHub by labs42io](https://github.com/labs42io/clean-code-typescript#function-arguments-2-or-fewer-ideally)
- [oida.dev | TypeScript, JavaScript, Rust](https://fettblog.eu/)

## Naming Conventions

### Enums

Use `camelCase` for the **keys** and **values** of your enums.

#### Example:

```ts
enum Direction {
    north = "north",
    northEast = "northEast",
    east = "east",
    southEast = "southEast",
    south = "south",
    southWest = "southWest",
    west = "west",
    northWest = "northWest",
}
```
