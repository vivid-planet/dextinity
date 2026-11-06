---
"@dextinity/cms-admin": major
---

Build the admin of `createCompositeBlock`, `createOptionalBlock`, `createOneOfBlock` and `createSpaceBlock` with `@dextinity/ui`

The factories keep their options, block state, input and output. Only their admin components change:

- `createOneOfBlock` chooses the block with a `Select` (`variant: "select"`), a `RadioGroup` (`"radio"`) or a `SegmentedControl` (`"toggle"`). The new `label` option names the control, visibly for the select and as the accessible name otherwise (default: "Block type"). Labels of supported blocks that aren't strings or `FormattedMessage`s can't be searched by typing.
- `createSpaceBlock` shows a `Select` with a visible label, set by the new `label` option (default: "Spacing").
- `createOptionalBlock` and `createCompositeBlock` draw their dividers and spacing with the design tokens instead of the MUI theme.
