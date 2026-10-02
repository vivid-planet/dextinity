---
description: When to write a block description and keeping it current
applyTo: "**/api/**/*.ts"
paths:
    - "**/api/**/*.ts"
globs:
    - "**/api/**/*.ts"
alwaysApply: false
---

# Block Rules

## Descriptions

- Describe a block through the `description` option of `createBlock`, or of a block factory that takes a `name`:

    ```ts
    export const HeadlineBlock = createBlock(HeadlineBlockData, HeadlineBlockInput, {
        name: "Headline",
        description: "A headline with an optional eyebrow text above it. Use it to introduce a section.",
    });
    ```

- The description is written to `block-meta.json`, where tools that work with block data read it, for instance the MCP server that assembles page content. Without a description they guess the purpose from the field names, and pick the wrong block when the names don't give it away.
- Add a description where the name and fields don't say what the block is for:
    - Blocks without fields whose behavior comes from outside the schema, such as an embedded third-party widget or a placeholder that a script fills at runtime.
    - Blocks whose fields only toggle data loaded elsewhere, so the block shows content the editor never typed.
    - Blocks that are easy to confuse with a similar block. Name that block and say how the two differ.
    - Blocks that store an id or a key instead of the content.
- Leave it out where the name and fields already say it, and on plain list and item blocks. A description that only repeats the name is worse than none.
- Write one or two sentences in English: what the block is for, and what a reader would otherwise get wrong. Don't list the fields, the schema shows them.
- When you change what a block does, which data it loads, or how it differs from a similar block, update its description in the same commit. An outdated description misleads more than a missing one.
