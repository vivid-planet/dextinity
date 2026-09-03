# Sort DTO

## File: `dto/{entity-name}.sort.ts`

## Sort Field Rules

**CRITICAL: The sort enum MUST include EVERY sortable field from the entity. Do not skip any.** Walk through every property in the entity and add it to the enum unless it falls into the exclude list below.

- **Include**: ALL scalar `@Property` fields (string, number, boolean, date, float, int), `position`, `id`, `createdAt`, `updatedAt`.
- **Include enums**: All `@Enum()` fields.
- **Include nested**: One level of ManyToOne relation fields as `{relation}_{field}` (e.g. `type_title`).
- **Exclude ONLY**: Relations (OneToMany, ManyToMany), block fields (`@RootBlock`), JSON/embedded fields.
- **Position**: Include `position` in enum if entity has position field.

## Example

For an entity `ProductTag` with fields: `title` (string), `slug` (string), `priority` (int), `isVisible` (boolean):

```typescript
import { SortDirection } from "@comet/cms-api";
import { Field, InputType, registerEnumType } from "@nestjs/graphql";
import { IsEnum } from "class-validator";

export enum ProductTagSortField {
    title = "title",
    slug = "slug",
    priority = "priority",
    isVisible = "isVisible",
    createdAt = "createdAt",
    updatedAt = "updatedAt",
    id = "id",
}

registerEnumType(ProductTagSortField, {
    name: "ProductTagSortField",
});

@InputType()
export class ProductTagSort {
    @Field(() => ProductTagSortField)
    @IsEnum(ProductTagSortField)
    field: ProductTagSortField;

    @Field(() => SortDirection, { defaultValue: SortDirection.ASC })
    @IsEnum(SortDirection)
    direction: SortDirection = SortDirection.ASC;
}
```

## Nested Sort Example

When entity has `@ManyToOne(() => ProductCategoryType) type`, add:

```typescript
export enum ProductCategorySortField {
    title = "title",
    slug = "slug",
    position = "position",
    type = "type",
    createdAt = "createdAt",
    updatedAt = "updatedAt",
    id = "id",
    type_title = "type_title", // nested relation sort
}
```
