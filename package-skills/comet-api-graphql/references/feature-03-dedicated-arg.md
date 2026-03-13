# Feature: Dedicated Resolver Arg

Apply when a `@ManyToOne` relation should be a top-level resolver argument instead of part of the input DTO. Typical for child entities scoped to a parent (e.g. variants of a product).

This moves the parent ID from the input DTO to a top-level resolver argument. Used for child entities scoped to a parent (e.g. `ProductVariant` belongs to `Product`).

## What changes

1. Parent field is **excluded from input DTO** (not in `ProductVariantInput`)
2. Parent becomes a **top-level `@Args`** in create mutation and list query
3. **Args DTO** gets the parent as a required field
4. **@AffectedEntity** uses parent entity on list query and create mutation
5. **Service** `create` method accepts parentId as a parameter
6. **Service** `findAll` method filters by parent (from args)

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

## Service changes

### findAll — filters by parent

```typescript
async findAll({ product, search, filter, sort, offset, limit }: ProductVariantsArgs, fields?: string[]): Promise<PaginatedProductVariants> {
    const where = gqlArgsToMikroOrmQuery({ search, filter }, this.entityManager.getMetadata(ProductVariant));
    where.product = product;  // filter by parent
    // ... rest as usual (options, populate, findAndCount)
}
```

### create — accepts parentId

```typescript
async create(product: string, input: ProductVariantInput): Promise<ProductVariant> {
    // ... destructure input ...
    const productVariant = this.entityManager.create(ProductVariant, {
        ...assignInput,
        product: Reference.create(await this.entityManager.findOneOrFail(Product, product)),
    });
    await this.entityManager.flush();
    return productVariant;
}
```

## Resolver changes

The resolver stays thin — it passes the dedicated arg to the service:

### List Query

```typescript
@Query(() => PaginatedProductVariants)
@AffectedEntity(Product, { idArg: "product" })
async productVariants(
    @Args() args: ProductVariantsArgs,
    @Info() info: GraphQLResolveInfo,
): Promise<PaginatedProductVariants> {
    const fields = extractGraphqlFields(info, { root: "nodes" });
    return this.productVariantsService.findAll(args, fields);
}
```

### Create Mutation

```typescript
@Mutation(() => ProductVariant)
@AffectedEntity(Product, { idArg: "product" })
async createProductVariant(
    @Args("product", { type: () => ID })
    product: string,
    @Args("input", { type: () => ProductVariantInput })
    input: ProductVariantInput,
): Promise<ProductVariant> {
    return this.productVariantsService.create(product, input);
}
```

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
