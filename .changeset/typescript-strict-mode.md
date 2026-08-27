---
"@dextinity/admin": minor
"@dextinity/admin-rte": minor
"@dextinity/cms-admin": minor
"@dextinity/brevo-admin": minor
"@dextinity/admin-generator": minor
"@dextinity/eslint-plugin": patch
---

Relax public types that prevented consumers from typing callback parameters

TypeScript's `strict` mode is now enabled for all packages. Its `strictFunctionTypes` check revealed several public types whose callback parameters were declared so narrowly (`unknown`, `object`, `Record<string, unknown>`) that consumers could not type them according to their own data. These callbacks are now either generic or typed permissively, so passing a narrowly typed callback no longer fails to compile:

- `DocumentInterface` and `InfoTagProps` (`@dextinity/cms-admin`) accept documents with a concrete input/output shape, so a heterogeneous `Record<DocumentType, DocumentInterface>` can hold them
- `createEditPageNode` (`@dextinity/cms-admin`) is generic over the values of its `additionalFormFields`
- `visibleOrderedBlocksForState` of `createCompositeBlock` (`@dextinity/cms-admin`) lets the block state be typed by the consumer
- `createBrevoContactsPage`, `createBrevoTestContactsPage` and `createTargetGroupsPage` (`@dextinity/brevo-admin`) are generic over their `input2State` values and their `exportFields` row
- `validate` of a form field config (`@dextinity/admin-generator`) lets the field value be typed by the consumer
- `injectFormVariables` (`@dextinity/admin-generator`) is generic over the injected variables, so the values of other form fields can be typed alongside `InjectedFormVariables`

**Example**

```tsx
// Now compiles, previously failed with "Types of parameters are incompatible"
const EditPageNode = createEditPageNode({
    valuesToInput: ({ values }: { values: { userGroup: string } }) => ({ userGroup: values.userGroup }),
    nodeFragment: additionalPageTreeNodeFieldsFragment,
});
```

Further changes to public types:

- `onOpen` and `onClose` of `useAsyncOptionsProps` and `useAsyncAutocompleteOptionsProps` (`@dextinity/admin`) receive a `SyntheticEvent` instead of a `ChangeEvent`, matching what MUI passes
- `createFetch` (`@dextinity/admin`) accepts a `URL` as input, matching the global `fetch`
- `onButtonClick` of `ControlButton` (`@dextinity/admin-rte`) receives a `MouseEvent<HTMLButtonElement>`, matching the rendered `button`
- `requiredValidator` (`@dextinity/admin-rte`) is declared as a plain function instead of a `FieldValidator`, so it can be used for a `string`-valued field

Fix `FormMutation` (`@dextinity/admin`) accessing `this.props` instead of `props`, which made the component throw when rendered.
