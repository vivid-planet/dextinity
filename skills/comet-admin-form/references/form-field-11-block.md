# Block Fields (DamImageBlock, RTE, etc.)

Block fields integrate CMS block components (DAM images, rich text editors, custom blocks) into Final Form. They require special state/output conversion.

## Setup

Collect all block fields into a `rootBlocks` object:

```tsx
import { BlockState, createFinalFormBlock } from "@comet/cms-admin";
import { DamImageBlock } from "@comet/cms-admin";
import isEqual from "lodash.isequal";

const rootBlocks = {
    image: DamImageBlock,
};
```

## FormValues type

Block fields must override the GQL fragment type with `BlockState`:

```tsx
type FormValues = Omit<GQLProductFormDetailsFragment, "image"> & {
    image: BlockState<typeof rootBlocks.image>;
};
```

## initialValues

Convert GQL data to block state using `input2State`:

```tsx
const initialValues = useMemo<Partial<FormValues>>(
    () =>
        data?.product
            ? {
                  ...filterByFragment<...>(productFormFragment, data.product),
                  image: rootBlocks.image.input2State(data.product.image),
              }
            : {
                  image: rootBlocks.image.defaultValues(),
              },
    [data],
);
```

## handleSubmit output

Convert block state back to GQL output using `state2Output`:

```ts
image: rootBlocks.image.state2Output(formValues.image),
```

## Component

```tsx
<Field name="image" isEqual={isEqual} label={<FormattedMessage id="product.image" defaultMessage="Image" />} variant="horizontal" fullWidth>
    {createFinalFormBlock(rootBlocks.image)}
</Field>
```

## GQL fragment

Block fields are **not included in the GQL fragment** directly — the block component handles its own sub-query. The fragment type is overridden via `Omit` + `BlockState`.

## Rules

- `isEqual` prop on `<Field>` is **required** for block fields to detect changes correctly
- Use `input2State` for edit mode initialization and `defaultValues()` for add mode
- Use `state2Output` in handleSubmit to convert back to GQL format
- Import `BlockState`, `createFinalFormBlock`, and block components (e.g. `DamImageBlock`) from `@comet/cms-admin`
