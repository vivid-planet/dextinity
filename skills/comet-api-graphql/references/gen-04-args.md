# Args DTO

## File: `dto/{entity-names}.args.ts`

```typescript
import { ArgsType, Field } from "@nestjs/graphql";
import { Type } from "class-transformer";
import { IsOptional, IsString, ValidateNested } from "class-validator";
import { OffsetBasedPaginationArgs, SortDirection } from "@comet/cms-api";
import { ProductTagFilter } from "./product-tag.filter";
import { ProductTagSort, ProductTagSortField } from "./product-tag.sort";

@ArgsType()
export class ProductTagsArgs extends OffsetBasedPaginationArgs {
    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    search?: string;

    @Field(() => ProductTagFilter, { nullable: true })
    @ValidateNested()
    @Type(() => ProductTagFilter)
    @IsOptional()
    filter?: ProductTagFilter;

    @Field(() => [ProductTagSort], { defaultValue: [{ field: ProductTagSortField.createdAt, direction: SortDirection.ASC }] })
    @ValidateNested({ each: true })
    @Type(() => ProductTagSort)
    sort: ProductTagSort[];
}
```

## Rules

- **Extends** `OffsetBasedPaginationArgs` when `paging: true` (default). When `paging: false`, use plain `@ArgsType()` without extending.
- **Default sort**: `createdAt ASC` normally. `position ASC` if entity has position field.
- **Search field**: Include when entity has string fields (searchable by default).
- **File name**: Uses plural entity name (e.g. `product-tags.args.ts`).
- When singular equals plural (e.g. `News`), name the class `NewsListArgs`.
