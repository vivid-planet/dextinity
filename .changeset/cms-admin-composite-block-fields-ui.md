---
"@dextinity/cms-admin": major
---

Build the fields of `createCompositeBlockTextField`, `createCompositeBlockSelectField` and `createCompositeBlockSwitchField` with `@dextinity/ui`

The factories keep their names, default values, and block state. Only their options change:

- The options no longer extend the MUI `TextFieldProps`, `SelectFieldProps` and `SwitchFieldProps`. Props like `sx`, `InputProps`, `variant` or `endAdornment` aren't supported anymore. The common options `label`, `helperText`, `placeholder`, `required`, `disabled` and `validate` stay.
- `label` is required, since every field needs a visible label. Move a `title` of the composite block entry into `label` where the field had none.
- The deprecated `fieldProps` option is removed. Set the props directly.
- `fullWidth` has no effect, as the fields always fill their container. It's deprecated and will be removed.
- `createCompositeBlockTextField` shows a textarea with `multiline` and `rows`. Use `disableContentTranslation` to hide the "Translate" action.
- The options of `createCompositeBlockSelectField` are `SelectOption`s of `@dextinity/ui`: an `icon` goes into `icon` instead of the `label`. A label that isn't a string or a `FormattedMessage` needs a `textValue`. Lists choose several options; set `multiple` to override it. Type option lists defined outside the factory call with the new `CompositeBlockSelectFieldOption`.

```tsx
createCompositeBlockSelectField<"left" | "center">({
    label: <FormattedMessage id="stage.alignment" defaultMessage="Alignment" />,
    defaultValue: "left",
    options: [
        { value: "left", label: <FormattedMessage id="stage.alignment.left" defaultMessage="Left" /> },
        { value: "center", label: <FormattedMessage id="stage.alignment.center" defaultMessage="Center" /> },
    ],
});
```

`BlocksFinalForm` shows the errors and warnings of `@dextinity/ui-react-final-form` field adapters right away, as it already did for the MUI fields, because block forms save on every change without a submit.
