# Nested Input DTO

Generated for each `@OneToMany` relation where the child entity is nested (no own CRUD, managed inline through the parent). The parent's `@OneToMany` typically uses `orphanRemoval: true`.

## File: `dto/{entity-name}-nested-{related-entity-name}.input.ts`

Example: `ProductTag` has `@OneToMany(() => ProductToTag, ..., { orphanRemoval: true })`:

```typescript
import { Field, InputType, ID } from "@nestjs/graphql";
import { IsNotEmpty, IsString, IsUUID } from "class-validator";

@InputType()
export class ProductTagNestedProductToTagInput {
    @IsNotEmpty()
    @IsString()
    @Field()
    status: string;

    @IsNotEmpty()
    @IsUUID()
    @Field(() => ID)
    product: string;
}
```

## Rules

- **Name pattern**: `{ParentEntity}Nested{ChildEntity}Input` (e.g. `ProductTagNestedProductToTagInput`).
- **Include** all fields of the child entity except `id`, `createdAt`, `updatedAt`, and the back-reference to the parent.
- **ManyToOne** in the child becomes a UUID string field (the FK ID).
- **No UpdateInput** — nested inputs are always fully replaced (orphanRemoval).

## Usage in Parent Input

```typescript
@Field(() => [ProductTagNestedProductToTagInput], { defaultValue: [] })
@IsArray()
@Type(() => ProductTagNestedProductToTagInput)
productsWithStatus: ProductTagNestedProductToTagInput[];
```

## Usage in Service (create/update)

Nested input handling belongs in the **service** (not the resolver):

```typescript
if (productsWithStatusInput) {
    await entity.productsWithStatus.loadItems();
    entity.productsWithStatus.set(
        await Promise.all(
            productsWithStatusInput.map(async (itemInput) => {
                const { product: productInput, ...assignInput } = itemInput;
                const item = this.entityManager.assign(new ProductToTag(), {
                    ...assignInput,
                    product: Reference.create(await this.entityManager.findOneOrFail(Product, productInput)),
                });
                return item;
            }),
        ),
    );
}
```
