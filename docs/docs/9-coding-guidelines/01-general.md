---
title: General (all programming languages)
sidebar_position: -5
---

## Use Descriptive Naming

The goal of names is to help developers understand the code without having to read the detailed implementation.

:::warning Bad

```ts
// calculates the sum of all products in the cart and removes the discount
const price = (c: C) => {
    return c.prods.reduce((s, p) => s + p.price - p.disc, 0);
};
```

:::

:::tip Good

```ts
const getCartPriceWithDiscounts = (cart: Cart) => {
    return cart.products.reduce((total, product) => total + product.price - product.discount, 0);
};
```

:::

### Boolean Naming

The name should indicate that the variable is a boolean.

:::warning Bad

```ts
const error = true;
```

:::

:::tip Good

```ts
const hasError = true;
```

:::

:::note
Prefix with is/has/should (see: [Tips on naming boolean variables - Cleaner Code](https://dev.to/michi/tips-on-naming-boolean-variables-cleaner-code-35ig)).  
Verb-phrase flags (showFoo, hideFoo, canFoo, allowFoo, enableFoo, disableFoo) and well-known adjectives (loading, disabled, open) are fine too.
:::

### Affirmative Variables

Try to name variables in an affirmative form (avoid negative naming of variables)

:::warning Bad

```ts
const isNotComplete = false; // !isComplete is usually better
const isIncomplete = true; // could make sense if 'isComplete' is a known state of the object

if (!isNotComplete) {
} // hard to read
```

:::

:::tip Good

```ts
const isComplete = true;
```

:::

## Comments

Write a comment only for what the code can't show, for instance why a workaround is necessary or a hidden constraint.
Never write a comment that repeats what the code does.
Before you add a comment, try to make the code show it: rename a variable, extract a function, or replace a value with a named constant.
A comment can go stale when the code changes, so prefer code that shows the fact.

### Placement

A comment sits on the most specific code it explains: at the end of its line for a short note, or directly above it for a longer one.
A comment above a group of lines reads as an explanation of the whole group.

:::warning Bad

```ts
const client = createClient({
    baseUrl,
    // <why the timeout is needed>
    request: {
        timeout: 60_000,
        retries: 3,
    },
});
```

:::

:::tip Good

```ts
const client = createClient({
    baseUrl,
    request: {
        timeout: 60_000, // <why the timeout is needed>
        retries: 3,
    },
});
```

:::

When the comment explains a group as a whole, put it above the group:

:::tip Good

```ts
const client = createClient({
    baseUrl,
    // <why these retry settings are needed>
    retry: {
        attempts: 5,
        delay: 1_000,
    },
});
```

:::

## Avoid Non-Obvious Abbreviations

Abbreviations make it harder read code. Even more for new Devs or Devs who are not regularly working on that project.

> It’s better to save time thinking than to save time typing.

Avoid non-obvious abbreviations. Obvious, conventional abbreviations whose meaning is unambiguous in context are fine. When in doubt, spell it out.

### Exceptions:

- Obvious, conventional abbreviations whose meaning is unambiguous in context (e.g. `i` for a loop index, `id`, `ref`, `props`)
- Well-known abbreviations such as protocols (HTML, CSS, TCP, IP, SSO, API, …)
- Abbreviations coming from a 3rd party (API, Library, …)

When using PascalCase or camelCase abbreviations must not violate it.

:::warning Bad
GUIController
UIElement
:::

:::tip Good
GuiController
UiElement
:::

## Don’t use Exceptions as Flow Control

:::warning Bad

```ts
async function getFileName(fileId: string): string | undefined {
    try {
        const file = await fileService.findFileOrFail(fileId);
        return file.name;
    } catch (error) {
        if (error.message === "FileNotFound") {
            return undefined;
        }
    }
}
```

:::

:::tip Good

```ts
async function getFileName(fileId: string): string | undefined {
    if (!(await fileService.checkIfFileExists(fileId))) {
        return undefined;
    }

    const file = await fileService.findFileOrFail(fileId);
    return file.name;
}
```

:::

### Why?

Using exceptions as flow control is a considered anti-patterns. The reasons for this common consensus are manifold: For instance, an exception is basically a `GOTO` statement.

A good question to ask yourself is: **“if you use exceptions for normal situations, how do you locate unusual (i.e. exceptional) situations?”**

[Are exceptions as control flow considered a serious anti-pattern? If so, Why?](https://softwareengineering.stackexchange.com/questions/189222/are-exceptions-as-control-flow-considered-a-serious-antipattern-if-so-why)
