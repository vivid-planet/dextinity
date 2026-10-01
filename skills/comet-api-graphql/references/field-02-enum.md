# Field Type: Enums

## Single Enum

### Input

```typescript
import { ProductType } from "../entities/product.entity"; // or separate enum file

@IsNotEmpty()
@IsEnum(ProductType)
@Field(() => ProductType)
type: ProductType;

// Optional
@IsOptional()
@IsEnum(ProductType)
@Field(() => ProductType, { nullable: true })
type?: ProductType;
```

### Filter

Each enum filter gets a **dedicated file** `dto/{enum-name}.enum-filter.ts` with a named class extending `createEnumFilter(...)`:

```typescript
// dto/product-type.enum-filter.ts
import { createEnumFilter } from "@comet/cms-api";
import { InputType } from "@nestjs/graphql";

import { ProductType } from "../entities/product.entity";

@InputType()
export class ProductTypeEnumFilter extends createEnumFilter(ProductType) {}
```

```typescript
// In filter class:
import { ProductTypeEnumFilter } from "./product-type.enum-filter";

@Field(() => ProductTypeEnumFilter, { nullable: true })
@ValidateNested()
@IsOptional()
@Type(() => ProductTypeEnumFilter)
type?: ProductTypeEnumFilter;
```

### Sort

Include in sort enum: `type = "type"`.

---

## Enum Array

### Input

```typescript
@IsNotEmpty()
@IsEnum(ProductType, { each: true })
@Field(() => [ProductType])
types: ProductType[];

// Optional
@IsOptional()
@IsEnum(ProductType, { each: true })
@Field(() => [ProductType], { nullable: true })
types?: ProductType[];
```

### Filter

Dedicated file `dto/{enum-name}.enums-filter.ts` (note the plural `enums`) using `createEnumsFilter`:

```typescript
// dto/product-type.enums-filter.ts
import { createEnumsFilter } from "@comet/cms-api";
import { InputType } from "@nestjs/graphql";

import { ProductType } from "../entities/product.entity";

@InputType()
export class ProductTypeEnumsFilter extends createEnumsFilter(ProductType) {}
```

```typescript
// In filter class:
import { ProductTypeEnumsFilter } from "./product-type.enums-filter";

@Field(() => ProductTypeEnumsFilter, { nullable: true })
@ValidateNested()
@IsOptional()
@Type(() => ProductTypeEnumsFilter)
types?: ProductTypeEnumsFilter;
```

### Sort

Enum arrays are NOT sortable.

## Rules

- Import the enum from the entity file or its dedicated enum file.
- `createEnumFilter` for single enum, `createEnumsFilter` for array enum (note the 's').
- **Enum filters live in dedicated files**: `dto/{enum-name}.enum-filter.ts` / `dto/{enum-name}.enums-filter.ts` with a named `@InputType()` class `{EnumName}EnumFilter` / `{EnumName}EnumsFilter` extending the factory. Never declare the filter as an inline `const` with `typeof`.
- **Enum value convention**: Use PascalCase for both keys and values (e.g., `Published = "Published"`, `OutOfStock = "OutOfStock"`), NOT UPPER_SNAKE_CASE.
