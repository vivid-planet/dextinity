# Input DTO

## File: `dto/{entity-name}.input.ts`

```typescript
import { Field, InputType, ID } from "@nestjs/graphql";
import { Type } from "class-transformer";
import { PartialType } from "@comet/cms-api";
import { IsArray, IsNotEmpty, IsString, IsUUID } from "class-validator";

@InputType()
export class ProductTagInput {
    @IsNotEmpty()
    @IsString()
    @Field()
    title: string;

    @Field(() => [ID], { defaultValue: [] })
    @IsArray()
    @IsUUID(undefined, { each: true })
    products: string[];
}

@InputType()
export class ProductTagUpdateInput extends PartialType(ProductTagInput) {}
```

## Rules

- **Import `PartialType` from `@comet/cms-api`**, never from `@nestjs/graphql`.
- **UpdateInput** always `extends PartialType(EntityInput)` — no additional fields.
- **`[OptionalProps]`** on the entity does NOT affect validation — still use `@IsNotEmpty()` for required fields.
- **Exclude** from input: `id`, `createdAt`, `updatedAt`, `position` (handled separately), and fields that should not be user-editable.
- **Nullable fields**: Use `@IsOptional()` + `{ nullable: true }` on `@Field`.
- See field-specific reference files for per-type examples.

## Validation Reference

Every input field MUST have validation decorators. These are the single source of truth for data integrity — the GraphQL type system alone is not sufficient.

### Decorator Order Convention

Always apply decorators in this order (top to bottom):

1. **Presence**: `@IsNotEmpty()` or `@IsOptional()`
2. **Type/format validator**: `@IsString()`, `@IsInt()`, `@IsEmail()`, `@IsEnum(MyEnum)`, etc.
3. **Constraint validators**: `@MaxLength(120)`, `@Min(1)`, `@Max(100)`, etc.
4. **Nested/transform** (when applicable): `@ValidateNested()`, `@Type(() => ...)`, `@Transform(...)`
5. **GraphQL field**: `@Field()` or `@Field(() => Type, { ... })`

### Required vs Optional

| Entity property                    | Input decorators                                                      |
| ---------------------------------- | --------------------------------------------------------------------- |
| Required (no `?`, no default)      | `@IsNotEmpty()` + type validator                                      |
| Nullable (`?` or `nullable: true`) | `@IsOptional()` + type validator + `@Field({ nullable: true })`       |
| Has default value in entity        | `@IsNotEmpty()` in input — the DTO doesn't know about entity defaults |

> **Important**: `@IsNotEmpty()` rejects `null`, `undefined`, and empty strings. `@IsOptional()` allows `null` and `undefined` (skips all subsequent validators when value is missing).

### Validator Mapping — Entity Property to Input Decorator

Derive input validators from the entity's MikroORM property decorators:

| Entity decorator / type                      | Input validators                                                           | Notes                                     |
| -------------------------------------------- | -------------------------------------------------------------------------- | ----------------------------------------- |
| `@Property({ type: "text" })` / `string`     | `@IsString()`                                                              | No length limit                           |
| `@Property({ length: N })` / `string`        | `@IsString()` + `@MaxLength(N)`                                            | Always mirror the length constraint       |
| `@Property({ type: "integer" })` / `number`  | `@IsInt()` + `@Field(() => Int)`                                           |                                           |
| `@Property({ type: "float" })` / `number`    | `@IsNumber()` + `@Field(() => Float)`                                      |                                           |
| `@Property({ type: "boolean" })` / `boolean` | `@IsBoolean()`                                                             |                                           |
| `@Property({ type: "date" })` / `Date`       | `@IsDate()`                                                                | DateTime — use `DateTimeFilter` in filter |
| `@Enum(() => MyEnum)`                        | `@IsEnum(MyEnum)` + `@Field(() => MyEnum)`                                 |                                           |
| `@Enum(() => MyEnum)` (array)                | `@IsEnum(MyEnum, { each: true })` + `@Field(() => [MyEnum])`               |                                           |
| `@ManyToOne` (required)                      | `@IsUUID()` + `@Field(() => ID)`                                           | FK as UUID string                         |
| `@ManyToOne` (nullable)                      | `@IsUUID()` + `@Field(() => ID, { nullable: true })`                       |                                           |
| `@ManyToOne` (FileUpload)                    | `@IsString()` + `@Field()`                                                 | FileUpload uses string IDs, NOT UUID      |
| `@ManyToMany`                                | `@IsArray()` + `@IsUUID(undefined, { each: true })` + `@Field(() => [ID])` |                                           |
| `@RootBlock(BlockType)`                      | 4-decorator pattern — see [field-04-block.md](field-04-block.md)           |                                           |
| `@Embedded(() => Type)`                      | `@ValidateNested()` + `@Type(() => InputType)`                             |                                           |
| JSON object                                  | `@ValidateNested()` + `@Type(() => InputType)`                             |                                           |
| JSON array of objects                        | `@IsArray()` + `@ValidateNested()` + `@Type(() => InputType)`              |                                           |

### Semantic Validators

When a field has a well-known format, prefer a semantic validator over the generic type validator:

| Field meaning       | Validator        | Instead of    | Import            |
| ------------------- | ---------------- | ------------- | ----------------- |
| Email               | `@IsEmail()`     | `@IsString()` | `class-validator` |
| URL                 | `@IsUrl()`       | `@IsString()` | `class-validator` |
| Latitude            | `@IsLatitude()`  | `@IsNumber()` | `class-validator` |
| Longitude           | `@IsLongitude()` | `@IsNumber()` | `class-validator` |
| Slug                | `@IsSlug()`      | `@IsString()` | `@comet/cms-api`  |
| UUID (non-relation) | `@IsUUID()`      | `@IsString()` | `class-validator` |

### Constraint Validators

Apply constraint validators when the entity or domain logic imposes limits:

| Constraint        | Decorator             | Example                                               |
| ----------------- | --------------------- | ----------------------------------------------------- |
| String max length | `@MaxLength(N)`       | Entity has `@Property({ length: 120 })`               |
| String min length | `@MinLength(N)`       | E.g. passwords, codes                                 |
| Number minimum    | `@Min(N)`             | E.g. `@Min(1)` for position, `@Min(0)` for quantities |
| Number maximum    | `@Max(N)`             | E.g. `@Max(100)` for percentage                       |
| Array min size    | `@ArrayMinSize(N)`    | E.g. at least 1 tag required                          |
| Array max size    | `@ArrayMaxSize(N)`    | E.g. max 10 images                                    |
| Regex pattern     | `@Matches(/pattern/)` | E.g. hex color codes, postal codes                    |

### When to use `@Type(() => ...)` from class-transformer

`@Type()` is required whenever a field contains a **nested object** that needs class instantiation for validation to work:

| Field type                                     | Needs `@Type()`?                 | Example                                    |
| ---------------------------------------------- | -------------------------------- | ------------------------------------------ |
| Scalar (`string`, `number`, `boolean`, `Date`) | No                               | —                                          |
| Enum                                           | No                               | —                                          |
| UUID / ID (string)                             | No                               | —                                          |
| Nested `@InputType()` object                   | **Yes**                          | `@Type(() => AddressInput)`                |
| Array of nested objects                        | **Yes**                          | `@Type(() => ContactInput)`                |
| Filter DTO                                     | **Yes**                          | `@Type(() => ProductFilter)`               |
| Sort DTO                                       | **Yes**                          | `@Type(() => ProductSort)`                 |
| Block input (`BlockInputInterface`)            | No — uses `@Transform()` instead | See [field-04-block.md](field-04-block.md) |

### Array Field Validation

For array fields, validators that check individual items use `{ each: true }`:

```typescript
// Array of UUIDs
@IsArray()
@IsUUID(undefined, { each: true })
@Field(() => [ID], { defaultValue: [] })
items: string[];

// Array of enums
@IsArray()
@IsEnum(ProductType, { each: true })
@Field(() => [ProductType])
types: ProductType[];

// Array of nested objects
@IsArray()
@ValidateNested()
@Type(() => ContactInput)
@Field(() => [ContactInput], { defaultValue: [] })
contacts: ContactInput[];
```

> **Note**: `@ValidateNested()` for arrays does NOT need `{ each: true }` — class-transformer handles the array iteration.

### Common Mistakes to Avoid

- **Missing `@IsNotEmpty()`**: Every required field MUST have `@IsNotEmpty()`. Without it, empty strings and null values pass validation silently.
- **Missing `@MaxLength()`**: If the entity has `@Property({ length: N })`, the input MUST have `@MaxLength(N)`. Without it, values exceeding the column length cause database errors at runtime.
- **Wrong `PartialType` import**: Always from `@comet/cms-api`, never from `@nestjs/graphql`. The NestJS version doesn't preserve validators correctly.
- **`@IsString()` for UUID relations**: ManyToOne relation fields use `@IsUUID()`, not `@IsString()`. Exception: FileUpload IDs use `@IsString()`.
- **Missing `@Type()` for nested objects**: Without `@Type()`, class-transformer cannot instantiate the nested class, and `@ValidateNested()` silently skips validation.
- **`@IsOptional()` with `@IsNotEmpty()`**: Never combine these — they contradict each other. Use one or the other.
