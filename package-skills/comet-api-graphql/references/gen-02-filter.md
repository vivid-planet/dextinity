# Filter DTO

## File: `dto/{entity-name}.filter.ts`

```typescript
import { IsOptional, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { Field, InputType } from "@nestjs/graphql";
import { DateTimeFilter, IdFilter, ManyToManyFilter, OneToManyFilter, StringFilter } from "@comet/cms-api";

@InputType()
export class ProductTagFilter {
    @Field(() => IdFilter, { nullable: true })
    @ValidateNested()
    @IsOptional()
    @Type(() => IdFilter)
    id?: IdFilter;

    @Field(() => StringFilter, { nullable: true })
    @ValidateNested()
    @IsOptional()
    @Type(() => StringFilter)
    title?: StringFilter;

    @Field(() => ManyToManyFilter, { nullable: true })
    @ValidateNested()
    @IsOptional()
    @Type(() => ManyToManyFilter)
    products?: ManyToManyFilter;

    @Field(() => OneToManyFilter, { nullable: true })
    @ValidateNested()
    @IsOptional()
    @Type(() => OneToManyFilter)
    productsWithStatus?: OneToManyFilter;

    @Field(() => DateTimeFilter, { nullable: true })
    @ValidateNested()
    @IsOptional()
    @Type(() => DateTimeFilter)
    createdAt?: DateTimeFilter;

    @Field(() => DateTimeFilter, { nullable: true })
    @ValidateNested()
    @IsOptional()
    @Type(() => DateTimeFilter)
    updatedAt?: DateTimeFilter;

    // --- Always include and/or ---
    @Field(() => [ProductTagFilter], { nullable: true })
    @Type(() => ProductTagFilter)
    @ValidateNested({ each: true })
    @IsOptional()
    and?: ProductTagFilter[];

    @Field(() => [ProductTagFilter], { nullable: true })
    @Type(() => ProductTagFilter)
    @ValidateNested({ each: true })
    @IsOptional()
    or?: ProductTagFilter[];
}
```

## Filter Type Mapping

| Property Type                  | Filter Class                | Import from      |
| ------------------------------ | --------------------------- | ---------------- |
| `string` / `text`              | `StringFilter`              | `@comet/cms-api` |
| `number` / `int` / `float`     | `NumberFilter`              | `@comet/cms-api` |
| `boolean`                      | `BooleanFilter`             | `@comet/cms-api` |
| `Date` (datetime)              | `DateTimeFilter`            | `@comet/cms-api` |
| `Date` (date only / LocalDate) | `DateFilter`                | `@comet/cms-api` |
| UUID / ID                      | `IdFilter`                  | `@comet/cms-api` |
| Enum (single)                  | `createEnumFilter(MyEnum)`  | `@comet/cms-api` |
| Enum (array)                   | `createEnumsFilter(MyEnum)` | `@comet/cms-api` |
| `@ManyToOne`                   | `ManyToOneFilter`           | `@comet/cms-api` |
| `@OneToMany`                   | `OneToManyFilter`           | `@comet/cms-api` |
| `@ManyToMany`                  | `ManyToManyFilter`          | `@comet/cms-api` |
| `@OneToOne`                    | NOT included in filter      | —                |

## Rules

- **Always include** `id` filter (IdFilter), `and`/`or` recursive filters, `createdAt`/`updatedAt` if entity has them.
- **Exclude** fields that should not be filterable (e.g. block fields, JSON fields).
- **OneToOne** relations are never in filter.
- Every filter field is `nullable: true` and `@IsOptional()`.
- Enum filters: Use `createEnumFilter(MyEnum)` which returns a class — use it directly as the type.
