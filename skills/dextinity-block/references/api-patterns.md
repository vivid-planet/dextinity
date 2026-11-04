# API Block Patterns

Dextinity-specific patterns for API-layer block definitions. All API blocks live in `{block-name}.block.ts` (kebab-case) inside `api/src/`, typically under `documents/pages/blocks/` or `common/blocks/`.

---

## Imports

```ts
import {
    BlockData,
    BlockDataInterface,
    BlockField,
    BlockInput,
    blockInputToData,
    ChildBlock,
    ChildBlockInput,
    createBlock,
    ExtractBlockInput,
    IsUndefinable, // from @dextinity/cms-api, not class-validator
} from "@dextinity/cms-api";
```

Factory functions (`createListBlock`, `createBlocksBlock`, `createOneOfBlock`, `createOptionalBlock`) are also imported from `@dextinity/cms-api`. Standard validators (`@IsString`, `@IsInt`, `@IsBoolean`, `@IsEnum`, `@Min`, `@Max`) come from `class-validator`.

---

## BlockData and BlockInput

`BlockData` declares the output shape; `BlockInput` declares what the admin sends. Neither class is exported — only the final block constant is.

```ts
class MyBlockData extends BlockData {
    @BlockField({ nullable: true })
    title?: string;

    @ChildBlock(DamImageBlock)
    image: BlockDataInterface;
}

class MyBlockInput extends BlockInput {
    @IsUndefinable()
    @IsString()
    @BlockField({ nullable: true })
    title?: string;

    @ChildBlockInput(DamImageBlock)
    image: ExtractBlockInput<typeof DamImageBlock>;

    transformToBlockData(): MyBlockData {
        return blockInputToData(MyBlockData, this);
    }
}

export const MyBlock = createBlock(MyBlockData, MyBlockInput, "My");
```

Key rules:

- `transformToBlockData()` must call `blockInputToData(DataClass, this)` — never manually map properties.
- `@ChildBlock` properties in `BlockData` are always typed as `BlockDataInterface`.
- `@ChildBlockInput` properties in `BlockInput` are always typed as `ExtractBlockInput<typeof SomeBlock>`.
- The third argument to `createBlock` is the block name: PascalCase **without** a "Block" suffix, unique across the project. Pass an options object with `name` instead only when you set another option, such as a `description`. See [Description](#description).

---

## Description

The `description` option of `createBlock`, and of the block factories that take a `name`, is written to `block-meta.json`. Tools that work with block data read it there, for instance the MCP server that assembles page content. Without a description they guess the purpose from the field names, and pick the wrong block when the names don't give it away.

```ts
export const HeadlineBlock = createBlock(HeadlineBlockData, HeadlineBlockInput, {
    name: "Headline",
    description: "A headline with an optional eyebrow text above it. Use it to introduce a section.",
});
```

Add a description where the name and fields don't say what the block is for:

- Blocks without fields whose behavior comes from outside the schema, such as an embedded third-party widget or a placeholder that a script fills at runtime.
- Blocks whose fields only toggle data loaded elsewhere, so the block shows content the editor never typed.
- Blocks that are easy to confuse with a similar block. Name that block and say how the two differ.
- Blocks that store an id or a key instead of the content.

Leave it out where the name and fields already say it, and on plain list and item blocks. A description that only repeats the name is worse than none.

Write one or two sentences in English: what the block is for, and what a reader would otherwise get wrong. Don't list the fields, the schema shows them.

When you change what a block does, which data it loads, or how it differs from a similar block, update its description in the same commit. An outdated description misleads more than a missing one.

---

## @IsUndefinable vs @IsOptional

**Always use `@IsUndefinable()` from `@dextinity/cms-api` for nullable fields — never `@IsOptional()`.**

- `@IsUndefinable()` permits only `undefined` and enforces all other validators on non-undefined values.
- `@IsOptional()` also allows `null` and silently skips all other validators — this can hide validation bugs.

```ts
// Correct
@IsUndefinable()
@IsString()
@BlockField({ nullable: true })
title?: string;

// Wrong — @IsOptional() skips @IsString() when the value is absent
@IsOptional()
@IsString()
@BlockField({ nullable: true })
title?: string;
```

---

## @BlockField options

| Option     | Notes                                                                              |
| ---------- | ---------------------------------------------------------------------------------- |
| `nullable` | Allow `undefined`. Always pair with `@IsUndefinable()` on the input property.      |
| `type`     | Required for `"enum"` and `"json"`. Auto-detected for string, number, and boolean. |
| `enum`     | Required when `type: "enum"`. Pass the enum object or string array.                |
| `array`    | Mark the field as an array of the given type.                                      |

### Enum fields — always specify `type: "enum"`

The `type: "enum"` option is **required** — omitting it causes incorrect type inference.

```ts
export enum Alignment {
    left = "left",
    center = "center",
}

// BlockData
@BlockField({ type: "enum", enum: Alignment })
alignment: Alignment;

// BlockInput
@IsEnum(Alignment)
@BlockField({ type: "enum", enum: Alignment })
alignment: Alignment;
```

An enum field needs a `defaultValue` and `required: true` in the Admin, unless it is optional (see [select.md](select.md#required-or-optional)).

### Enum array (multi-select)

```ts
// BlockData
@BlockField({ type: "enum", enum: ProductType, array: true })
types: ProductType[];

// BlockInput
@IsEnum(ProductType, { each: true })
@BlockField({ type: "enum", enum: ProductType, array: true })
types: ProductType[];
```

`@IsEnum(X, { each: true })` accepts empty arrays, so multi-select fields are automatically savable.

---

## Savability

All blocks must be savable in their initial (empty) state and after the user clears a field — admin users must be able to add a block and save without filling in any content.

| Field type        | API pattern                                                                                        | Admin default                                                | Pitfall                                                      |
| ----------------- | -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| String            | `@IsUndefinable()` + `@IsString()` + `@BlockField({ nullable: true })` + `?`                       | `""` (automatic)                                             | `@IsString()` rejects `undefined` without `@IsUndefinable()` |
| Enum (required)   | `@IsEnum(X)` + `@BlockField({ type: "enum", enum: X })`                                            | Must set `defaultValue` and `required: true`                 | `@IsEnum()` rejects `undefined`                              |
| Enum (optional)   | `@IsUndefinable()` + `@IsEnum(X)` + `@BlockField({ type: "enum", enum: X, nullable: true })` + `?` | `undefined`, see [select.md](select.md#required-or-optional) | `@IsEnum()` rejects `undefined` without `@IsUndefinable()`   |
| Enum array        | `@IsEnum(X, { each: true })` + `{ array: true }`                                                   | `[]` (automatic)                                             | Accepts empty arrays by default                              |
| Number (required) | `@IsInt()` + `@Min()` + `@Max()` + `@BlockField()`                                                 | Must set `defaultValue` and `required: true`                 | `@IsInt()` rejects `undefined`                               |
| Number (optional) | `@IsUndefinable()` + `@IsInt()` + `@Min()` + `@Max()` + `@BlockField({ nullable: true })` + `?`    | `undefined`, see [select.md](select.md#required-or-optional) | `@IsInt()` rejects `undefined` without `@IsUndefinable()`    |
| Boolean           | `@IsBoolean()` + `@BlockField()`                                                                   | `false` (automatic)                                          | `@IsBoolean()` rejects `undefined`; switch sends `false`     |
| Child block       | `@ChildBlockInput(X)` typed as `ExtractBlockInput<typeof X>`                                       | N/A                                                          | Each child block handles its own empty state                 |

**Strings should almost always be optional** to allow saving with no content.

---

## Factory blocks (API)

Full block-type examples live in [block-types.md](block-types.md). The critical API-layer rules:

```ts
// List block
export const FeatureListBlock = createListBlock({ block: FeatureItemBlock }, "FeatureList");

// Blocks block
export const PageContentBlock = createBlocksBlock({ supportedBlocks: { richText: RichTextBlock, heading: HeadingBlock } }, "PageContent");

// One-of block
export const MediaBlock = createOneOfBlock({ supportedBlocks: { image: DamImageBlock, damVideo: DamVideoBlock } }, "Media");
```

Keys in `supportedBlocks` must be **camelCase** and **identical** across all layers (API, Admin, Site).

---

## Naming conventions (API layer)

| Element                               | Convention                          | Example                 |
| ------------------------------------- | ----------------------------------- | ----------------------- |
| File name                             | kebab-case ending in `.block.ts`    | `product-card.block.ts` |
| `BlockData` class                     | `{BlockName}BlockData`              | `ProductCardBlockData`  |
| `BlockInput` class                    | `{BlockName}BlockInput`             | `ProductCardBlockInput` |
| Exported constant                     | `{BlockName}Block`                  | `ProductCardBlock`      |
| Block name (3rd arg of `createBlock`) | PascalCase, **no** "Block" suffix   | `"ProductCard"`         |
| Enum values                           | camelCase matching the string value | `left = "left"`         |
