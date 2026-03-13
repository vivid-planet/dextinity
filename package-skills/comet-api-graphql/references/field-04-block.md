# Field Type: Blocks (CMS Content)

Block fields use `@RootBlock(BlockType)` decorator and store structured content data.

> **Note**: Create/update handling for blocks belongs in the **service**. The resolver delegates block field resolution to the service's `transformToPlain` method. See [gen-07-service.md](gen-07-service.md).

## Input

```typescript
import { BlockInputInterface, DamImageBlock, PartialType, RootBlockInputScalar, isBlockInputInterface } from "@comet/cms-api";
import { Transform } from "class-transformer";
import { IsNotEmpty, ValidateNested } from "class-validator";

// In input class:
@IsNotEmpty()
@Field(() => RootBlockInputScalar(DamImageBlock))
@Transform(({ value }) => (isBlockInputInterface(value) ? value : DamImageBlock.blockInputFactory(value)), { toClassOnly: true })
@ValidateNested()
image: BlockInputInterface;
```

The 4-decorator pattern is always the same:

1. `@Field(() => RootBlockInputScalar(BlockType))`
2. `@Transform(({ value }) => (isBlockInputInterface(value) ? value : BlockType.blockInputFactory(value)), { toClassOnly: true })`
3. `@ValidateNested()`
4. `image: BlockInputInterface;`

## Filter / Sort

Block fields are **NOT included** in filter or sort.

## Service — Create

```typescript
const { image: imageInput, ...assignInput } = input;
const entity = this.entityManager.create(Entity, {
    ...assignInput,
    image: imageInput.transformToBlockData(),
});
```

## Service — Update

```typescript
const { image: imageInput, ...assignInput } = input;
entity.assign({ ...assignInput });
if (imageInput) {
    entity.image = imageInput.transformToBlockData();
}
```

## Service — transformToPlain helper

The service injects `BlocksTransformerService` and exposes a method for the resolver's `@ResolveField`:

```typescript
import { BlocksTransformerService } from "@comet/cms-api";

// In service constructor:
private readonly blocksTransformer: BlocksTransformerService,

// Service method:
async transformToPlain(blockData: object): Promise<object> {
    return this.blocksTransformer.transformToPlain(blockData);
}
```

## ResolveField (in resolver)

The resolver delegates block transformation to the service:

```typescript
import { RootBlockDataScalar, DamImageBlock } from "@comet/cms-api";

@ResolveField(() => RootBlockDataScalar(DamImageBlock))
async image(@Parent() entity: Entity): Promise<object> {
    return this.productsService.transformToPlain(entity.image);
}
```

## Rules

- Always destructure block fields from input before spreading (in the service).
- `BlocksTransformerService` is injected in the **service**, not the resolver.
- Common block types: `DamImageBlock`, `DamFileBlock`, custom `*Block` types from the project.
