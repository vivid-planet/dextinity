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

```typescript
import { createEnumFilter } from "@comet/cms-api";

const ProductTypeFilter = createEnumFilter(ProductType);

// In filter class:
@Field(() => ProductTypeFilter, { nullable: true })
@ValidateNested()
@IsOptional()
@Type(() => ProductTypeFilter)
type?: typeof ProductTypeFilter;
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

```typescript
import { createEnumsFilter } from "@comet/cms-api";

const ProductTypesFilter = createEnumsFilter(ProductType);

@Field(() => ProductTypesFilter, { nullable: true })
@ValidateNested()
@IsOptional()
@Type(() => ProductTypesFilter)
types?: typeof ProductTypesFilter;
```

### Sort

Enum arrays are NOT sortable.

## Rules

- Import the enum from the entity file or its dedicated enum file.
- `createEnumFilter` for single enum, `createEnumsFilter` for array enum (note the 's').
- The filter variable must be declared OUTSIDE the filter class (top-level const).
- **Enum value convention**: Use PascalCase for both keys and values (e.g., `Published = "Published"`, `OutOfStock = "OutOfStock"`), NOT UPPER_SNAKE_CASE.
