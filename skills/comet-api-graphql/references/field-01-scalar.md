# Field Type: Scalars

## String

### Input

```typescript
// Required — with length constraint from @Property({ length: 120 })
@IsNotEmpty()
@IsString()
@MaxLength(120)
@Field()
title: string;

// Required — text column (no length limit), no @MaxLength needed
@IsNotEmpty()
@IsString()
@Field()
body: string;

// Optional / nullable
@IsOptional()
@IsString()
@MaxLength(200)
@Field({ nullable: true })
description?: string;
```

**`@MaxLength` rule**: If the entity has `@Property({ length: N })`, always add `@MaxLength(N)` to the input. Omit `@MaxLength` for `text` columns (no length constraint).

### Filter

```typescript
@Field(() => StringFilter, { nullable: true })
@ValidateNested()
@IsOptional()
@Type(() => StringFilter)
title?: StringFilter;
```

### Sort

Include in sort enum: `title = "title"`.

### Search

String fields are searchable by default. They are matched via the `search` arg using LIKE queries.

---

## Number (Int / Float)

### Input

```typescript
// Int - required
@IsNotEmpty()
@IsInt()
@Field(() => Int)
quantity: number;

// Float - required
@IsNotEmpty()
@IsNumber()
@Field(() => Float)
price: number;

// Optional
@IsOptional()
@IsInt()
@Field(() => Int, { nullable: true })
stock?: number;
```

### Filter

```typescript
@Field(() => NumberFilter, { nullable: true })
@ValidateNested()
@IsOptional()
@Type(() => NumberFilter)
quantity?: NumberFilter;
```

### Sort

Include in sort enum: `quantity = "quantity"`.

---

## Boolean

### Input

```typescript
// Required
@IsNotEmpty()
@IsBoolean()
@Field()
isActive: boolean;

// With default value
@IsNotEmpty()
@IsBoolean()
@Field({ defaultValue: true })
isActive: boolean;
```

### Filter

```typescript
@Field(() => BooleanFilter, { nullable: true })
@ValidateNested()
@IsOptional()
@Type(() => BooleanFilter)
isActive?: BooleanFilter;
```

### Sort

Include in sort enum: `isActive = "isActive"`.

---

## Date / DateTime

### Input

```typescript
// DateTime (Date type in entity)
@IsNotEmpty()
@IsDate()
@Field()
publishedAt: Date;

// Optional
@IsOptional()
@IsDate()
@Field({ nullable: true })
publishedAt?: Date;
```

### Filter

```typescript
// DateTime (JS Date)
@Field(() => DateTimeFilter, { nullable: true })
@ValidateNested()
@IsOptional()
@Type(() => DateTimeFilter)
publishedAt?: DateTimeFilter;

// LocalDate (date-only, uses GraphQLLocalDate scalar)
@Field(() => DateFilter, { nullable: true })
@ValidateNested()
@IsOptional()
@Type(() => DateFilter)
eventDate?: DateFilter;
```

### Sort

Include in sort enum: `publishedAt = "publishedAt"`.

---

## Timestamps (`createdAt` / `updatedAt`)

- **Exclude** from input (auto-managed by MikroORM).
- **Include** in filter (DateTimeFilter).
- **Include** in sort enum.

---

## Semantic Validators

When a field has a well-known format, prefer a semantic validator from `class-validator` over the generic `@IsString()` / `@IsNumber()`:

| Field meaning       | Validator                           | Instead of    |
| ------------------- | ----------------------------------- | ------------- |
| Latitude            | `@IsLatitude()`                     | `@IsNumber()` |
| Longitude           | `@IsLongitude()`                    | `@IsNumber()` |
| Email               | `@IsEmail()`                        | `@IsString()` |
| URL                 | `@IsUrl()`                          | `@IsString()` |
| UUID (non-relation) | `@IsUUID()`                         | `@IsString()` |
| Slug                | `@IsSlug()` (from `@comet/cms-api`) | `@IsString()` |

These validators are used **in addition to** `@IsNotEmpty()` / `@IsOptional()`, replacing the generic type validator.
