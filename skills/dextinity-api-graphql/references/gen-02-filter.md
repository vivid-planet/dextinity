# Filter DTO

## File: `dto/{entity-name}.filter.ts`

```typescript
import { IsOptional, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { Field, InputType } from "@nestjs/graphql";
import { DateTimeFilter, IdFilter, ManyToManyFilter, OneToManyFilter, StringFilter } from "@dextinity/cms-api";

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

| Property Type                  | Filter Class                | Import from          |
| ------------------------------ | --------------------------- | -------------------- |
| `string` / `text`              | `StringFilter`              | `@dextinity/cms-api` |
| `number` / `int` / `float`     | `NumberFilter`              | `@dextinity/cms-api` |
| `boolean`                      | `BooleanFilter`             | `@dextinity/cms-api` |
| `Date` (datetime)              | `DateTimeFilter`            | `@dextinity/cms-api` |
| `Date` (date only / LocalDate) | `DateFilter`                | `@dextinity/cms-api` |
| UUID / ID                      | `IdFilter`                  | `@dextinity/cms-api` |
| Enum (single)                  | `createEnumFilter(MyEnum)`  | `@dextinity/cms-api` |
| Enum (array)                   | `createEnumsFilter(MyEnum)` | `@dextinity/cms-api` |
| `@ManyToOne`                   | `ManyToOneFilter`           | `@dextinity/cms-api` |
| `@OneToMany`                   | `OneToManyFilter`           | `@dextinity/cms-api` |
| `@ManyToMany`                  | `ManyToManyFilter`          | `@dextinity/cms-api` |
| `@OneToOne`                    | NOT included in filter      | —                    |

## Rules

- **Always include** `id` filter (IdFilter), `and`/`or` recursive filters, `createdAt`/`updatedAt` if entity has them.
- **Exclude** fields that should not be filterable (e.g. block fields, JSON fields).
- **OneToOne** relations are never in filter.
- Every filter field is `nullable: true` and `@IsOptional()`.
- Enum filters: dedicated file with a named class extending `createEnumFilter(MyEnum)` / `createEnumsFilter(MyEnum)` — see [field-02-enum.md](field-02-enum.md).
