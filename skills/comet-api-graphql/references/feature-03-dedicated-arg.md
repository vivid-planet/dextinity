# Feature: Dedicated Resolver Arg

Apply when a `@ManyToOne` relation should be a top-level resolver argument instead of part of the input DTO. Typical for child entities scoped to a parent (e.g. variants of a product).

This moves the parent ID from the input DTO to a top-level resolver argument. Used for child entities scoped to a parent (e.g. `ProductVariant` belongs to `Product`).

## What changes

1. Parent field is **excluded from input DTO** (not in `ProductVariantInput`)
2. Parent becomes a **top-level `@Args`** in create mutation and list query
3. **Args DTO** gets the parent as a required field
4. **@AffectedEntity** uses parent entity on list query and create mutation
5. **List query** filters by parent: `where.product = product`
6. **Create mutation** resolves the parent via `Reference.create` — the parent FK is not editable in update

## Args DTO changes

```typescript
@ArgsType()
export class ProductVariantsArgs extends OffsetBasedPaginationArgs {
    @Field(() => ID)
    @IsUUID()
    product: string; // dedicated arg — required, before search/filter/sort

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    search?: string;

    // ... filter, sort as usual
}
```

## Resolver changes

### List Query — filters by parent

```typescript
@Query(() => PaginatedProductVariants)
@AffectedEntity(Product, { idArg: "product" })
async productVariants(
    @Args()
    { product, search, filter, sort, offset, limit }: ProductVariantsArgs,
): Promise<PaginatedProductVariants> {
    const where = gqlArgsToMikroOrmQuery({ search, filter }, this.entityManager.getMetadata(ProductVariant));
    where.product = product; // filter by parent
    const options: FindOptions<ProductVariant> = { offset, limit };
    if (sort) {
        options.orderBy = gqlSortToMikroOrmOrderBy(sort);
    }
    const [entities, totalCount] = await this.entityManager.findAndCount(ProductVariant, where, options);
    return new PaginatedProductVariants(entities, totalCount);
}
```

### Create Mutation — accepts parent as top-level arg

```typescript
@Mutation(() => ProductVariant)
@AffectedEntity(Product, { idArg: "product" })
async createProductVariant(
    @Args("product", { type: () => ID })
    product: string,
    @Args("input", { type: () => ProductVariantInput })
    input: ProductVariantInput,
): Promise<ProductVariant> {
    const productVariant = this.entityManager.create(ProductVariant, {
        ...input,
        product: Reference.create(await this.entityManager.findOneOrFail(Product, product)),
    });
    await this.entityManager.flush();
    return productVariant;
}
```

> The update mutation does **not** get the dedicated arg — the parent FK is not editable.

## @ResolveField

The relation still gets a `@ResolveField`:

```typescript
@ResolveField(() => Product)
async product(
    @Parent() productVariant: ProductVariant,
): Promise<Product> {
    return productVariant.product.loadOrFail();
}
```
