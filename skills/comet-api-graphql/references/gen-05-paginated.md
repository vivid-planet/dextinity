# Paginated Response

## File: `dto/paginated-{entity-names}.ts`

```typescript
import { ObjectType } from "@nestjs/graphql";
import { PaginatedResponseFactory } from "@comet/cms-api";
import { Product } from "../entities/product.entity";

@ObjectType()
export class PaginatedProducts extends PaginatedResponseFactory.create(Product) {}
```

## Rules

- Class name: `Paginated{EntityPlural}` (e.g. `PaginatedProductTags`, `PaginatedNews`).
