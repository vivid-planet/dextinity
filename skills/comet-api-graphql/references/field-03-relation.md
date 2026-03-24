# Field Type: Relations

> **Note**: Create/update handling for relations belongs in the **service** (not the resolver). The resolver only handles `@ResolveField` methods for field resolution. See [gen-07-service.md](gen-07-service.md) for the service patterns.

## ManyToOne

### Input — required

```typescript
@IsNotEmpty()
@IsUUID()
@Field(() => ID)
category: string;  // FK as UUID string
```

### Input — nullable

```typescript
@IsOptional()
@IsUUID()
@Field(() => ID, { nullable: true })
category?: string;
```

### Input — FileUpload (non-UUID)

```typescript
@IsNotEmpty()
@IsString()  // NOT @IsUUID — FileUpload uses string IDs
@Field()
image: string;
```

### Filter

```typescript
@Field(() => ManyToOneFilter, { nullable: true })
@ValidateNested()
@IsOptional()
@Type(() => ManyToOneFilter)
category?: ManyToOneFilter;
```

### Sort

Include relation name in sort enum: `category = "category"`.
Nested sort: `category_title = "category_title"` (one level deep).

### Service — create

```typescript
const { category: categoryInput, ...assignInput } = input;
const entity = this.entityManager.create(Entity, {
    ...assignInput,
    category: Reference.create(await this.entityManager.findOneOrFail(Category, categoryInput)),
});
```

### Service — update (nullable)

```typescript
if (categoryInput !== undefined) {
    entity.category = categoryInput ? Reference.create(await this.entityManager.findOneOrFail(Category, categoryInput)) : undefined;
}
```

### ResolveField (in resolver)

```typescript
// Required
@ResolveField(() => Category)
async category(@Parent() entity: Entity): Promise<Category> {
    return entity.category.loadOrFail();
}

// Nullable
@ResolveField(() => Category, { nullable: true })
async category(@Parent() entity: Entity): Promise<Category | undefined> {
    return entity.category?.loadOrFail();
}
```

---

## ManyToMany

### Input

```typescript
@Field(() => [ID], { defaultValue: [] })
@IsArray()
@IsUUID(undefined, { each: true })
products: string[];
```

### Filter

```typescript
@Field(() => ManyToManyFilter, { nullable: true })
@ValidateNested()
@IsOptional()
@Type(() => ManyToManyFilter)
products?: ManyToManyFilter;
```

### Sort

ManyToMany is NOT sortable.

### Service — create/update

```typescript
if (productsInput) {
    const products = await this.entityManager.find(Product, { id: productsInput });
    if (products.length != productsInput.length) throw new Error("Couldn't find all products that were passed as input");
    await entity.products.loadItems();
    entity.products.set(products.map((product) => Reference.create(product)));
}
```

### ResolveField (in resolver)

```typescript
@ResolveField(() => [Product])
async products(@Parent() entity: Entity): Promise<Product[]> {
    return entity.products.loadItems();
}
```

---

## OneToMany

### Child has own CRUD (separate entity) — excluded from parent input

The OneToMany is **not in the parent's input DTO**. Parent only gets a `@ResolveField`. The child entity has its own full CRUD resolver/service, and its ManyToOne back to the parent uses the **dedicated resolver arg** pattern (see [feature-03-dedicated-arg.md](feature-03-dedicated-arg.md)).

### Child is nested (no own CRUD) — uses nested input

The child is only edited through the parent. Uses `orphanRemoval: true` on the OneToMany. See [gen-06-nested-input.md](gen-06-nested-input.md) for the nested input pattern.

### Filter

```typescript
@Field(() => OneToManyFilter, { nullable: true })
@ValidateNested()
@IsOptional()
@Type(() => OneToManyFilter)
items?: OneToManyFilter;
```

### Sort

OneToMany is NOT sortable.

### ResolveField (in resolver)

```typescript
@ResolveField(() => [ChildEntity])
async items(@Parent() entity: Entity): Promise<ChildEntity[]> {
    return entity.items.loadItems();
}
```

---

## OneToOne

### Filter

OneToOne is **NOT included** in filter.

### Input — as nested object

Similar to nested input pattern. Load existing or create new.

### ResolveField (in resolver)

```typescript
// Nullable
@ResolveField(() => RelatedEntity, { nullable: true })
async related(@Parent() entity: Entity): Promise<RelatedEntity | undefined> {
    return entity.related?.loadOrFail();
}

// Required
@ResolveField(() => RelatedEntity)
async related(@Parent() entity: Entity): Promise<RelatedEntity> {
    return entity.related.loadOrFail();
}
```

---

## Populate (in Service — findAll)

Add conditional populate in the service's `findAll` method for each relation with a `@ResolveField` in the resolver. The resolver extracts requested fields from `@Info()` and passes them to the service:

```typescript
// In service findAll method:
const populate: string[] = [];
if (fields?.includes("category")) {
    populate.push("category");
}
if (fields?.includes("products")) {
    populate.push("products");
}
```

```typescript
// In resolver list query:
@Query(() => PaginatedProducts)
async products(@Args() args: ProductsArgs, @Info() info: GraphQLResolveInfo): Promise<PaginatedProducts> {
    const fields = extractGraphqlFields(info, { root: "nodes" });
    return this.productsService.findAll(args, fields);
}
```
