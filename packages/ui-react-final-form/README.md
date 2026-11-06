# @dextinity/ui-react-final-form

An **experimental** adapter package that connects the form controls of [`@dextinity/ui`](../ui/README.md) to [React Final Form](https://final-form.org/react). `@dextinity/ui` stays free of form logic: its fields are plain controlled components, and each adapter here binds one of them to a field of the surrounding `<Form>`.

[`@dextinity/ui-react-hook-form`](../ui-react-hook-form/README.md) offers the same adapters for React Hook Form, with the same names and the same field-level props, so switching libraries is a matter of imports and the library-specific configuration props.

## Usage

```tsx
import { Button, SaveState } from "@dextinity/ui";
import { focusOnError, InputField, SelectField, SwitchField, useFormSaveState } from "@dextinity/ui-react-final-form";
import { Form } from "react-final-form";

function SaveStateOfForm() {
    return <SaveState {...useFormSaveState()} />;
}

<Form onSubmit={save} initialValues={page} decorators={[focusOnError]}>
    {({ handleSubmit }) => (
        <form onSubmit={handleSubmit} noValidate>
            <SaveStateOfForm />
            <InputField name="title" label="Title" required />
            <SelectField name="category" label="Category" options={categories} />
            <SwitchField name="published">Published</SwitchField>
            <Button type="submit">Save</Button>
        </form>
    )}
</Form>;
```

Set `noValidate` on the `<form>`: the adapters validate `required` themselves and show the message in the field, so the browser's own validation bubbles would only get in the way.

## Adapters

One adapter per value-holding control of `@dextinity/ui`. Each takes `name`, the props of its ui component except the ones it controls, and the field configuration of the form library.

| Adapter                 | ui component       | Form value                                               | Controlled props it takes over                                        |
| ----------------------- | ------------------ | -------------------------------------------------------- | --------------------------------------------------------------------- |
| `InputField`            | `Input`            | `string`                                                 | `name`, `value`, `onChange`, `onBlur`, `state`, `validationMessage`   |
| `TextareaField`         | `Textarea`         | `string`                                                 | `name`, `value`, `onChange`, `onBlur`, `state`, `validationMessage`   |
| `SelectField`           | `Select`           | `string \| null`, `string[]` with `multiple`             | `name`, `value`, `onChange`, `onBlur`, `state`, `validationMessage`   |
| `RichTextEditorField`   | `RichTextEditor`   | `string` (HTML)                                          | `name`, `value`, `onChange`, `onBlur`, `state`, `validationMessage`   |
| `CheckboxField`         | `Checkbox`         | `boolean`, or `string[]` when the checkbox has a `value` | `name`, `checked`, `onChange`, `onBlur`, `state`, `validationMessage` |
| `SwitchField`           | `Switch`           | `boolean`                                                | `name`, `checked`, `onChange`, `onBlur`, `state`, `validationMessage` |
| `SegmentedControlField` | `SegmentedControl` | one of the options' values                               | `value`, `onChange`, `onBlur`, `state`, `validationMessage`           |
| `SliderField`           | `Slider`           | `number`                                                 | `name`, `value`, `onChange`, `onBlur`, `state`, `validationMessage`   |
| `FocalPointPickerField` | `FocalPointPicker` | `FocalPoint` (`{ x, y }`)                                | `value`, `onChange`, `onBlur`, `state`, `validationMessage`           |

`Dropzone` (uploads, no value), `ScopeSwitcher` (navigation), and `CopyField` (read-only) have no adapter.

### Props contract

Shared by both adapter packages:

- **`name`** — the field's path in the form values, e.g. `title` or `seo.description`. It is also passed to the ui component where it takes one.
- **`required`** — marks the field where the ui component supports it (star and `aria-required` on the framed fields, `CheckboxField`, and `SwitchField`) and validates it: empty string, `null`/`undefined`, `false`, and an empty list are missing; for `RichTextEditorField`, markup without visible text is missing. A custom validation still runs on a non-empty value.
- **`requiredMessage`** — the message for a missing required value. Defaults to `"Required"`; pass a translated text.
- **`actions`** (`InputField`, `TextareaField`, `SelectField`, `RichTextEditorField`) — content at the label as in the ui component, or a function `({ value, setValue }) => ReactNode` to connect `FieldActions`, e.g. `actions={({ setValue }) => <FieldActions aiAssist onAiSuggest={suggest} onAiAccept={setValue} />}`.
- **`ref`** — forwarded to the ui component, so it reaches the same element as on the component itself.
- **`onFocus`** — still passed through, called after the adapter's own handler.
- Every other prop of the ui component passes through unchanged. `value`/`checked`, `onChange`, `onBlur`, `state`, and `validationMessage` are not available: the adapter sets them from the field.

`CheckboxField` with a `value` is one box of a group: the field holds the list of the checked boxes' values.

### Value mapping

An empty form value (`undefined`, or `""` from React Final Form's default `format`) maps to the control's empty state: `""` for text, `null` (or `[]` with `multiple`) for `SelectField`, unchecked for `CheckboxField` and `SwitchField`, no pressed option for `SegmentedControlField`, `min` for `SliderField`, and the center for `FocalPointPickerField`. The adapters write the control's value back unchanged; use `parse` and `format` to convert, e.g. a number entered in an `InputField`.

### Validation

A field shows its error once it was touched (blurred) or the form was submitted: `state="error"` with the message as `validationMessage`. A submit error for the field (returned from `onSubmit`) shows the same way until the field changes. Controls without a field frame – `CheckboxField`, `SwitchField`, `SegmentedControlField`, `SliderField`, and `FocalPointPickerField` – show it below the control, the same way.

To focus the first field with an error when submitting fails, in document order, add the `focusOnError` decorator to the `<Form>`: `decorators={[focusOnError]}`. React Final Form has no focus on error of its own. The boxes of a checkbox group count as one field, focused at the first box.

### React Final Form configuration

Each adapter takes the field configuration of `useField`, typed as `FinalFormFieldConfig<FieldValue, ControlValue>`: `validate`, `validateFields`, `parse`, `format`, `formatOnBlur`, `initialValue`, `defaultValue`, `isEqual`, `allowNull`, `data`, `beforeSubmit`, and `afterSubmit`. The adapters are generic in the form value, `FieldValue`, which defaults to the control's value; `parse` and `format` convert between the two. `SliderField` keeps the `Slider`'s own `format` (number formatting) and leaves out React Final Form's.

## Form helpers

Shared by both adapter packages, for the content of a form:

| Export                   | Purpose                                                                                                                                    |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `useFormSaveState()`     | `{ state, savedAt }` for `SaveState`: `saving` while submitting, `error` after a failed submit, `dirty` with unsaved changes, else `saved` |
| `useHasUnsavedChanges()` | Whether the form has changes that are not saved, e.g. to ask with a `ConfirmDialog` before leaving                                         |

A successful submit counts as saved even if the form keeps its initial values. Changes made while a save is running count as unsaved. A submit counts as failed when `onSubmit` returns submit errors, and reports `error` until the next change; a submit blocked by validation errors doesn't change the state.

Shared types: `FieldAdapterBaseProps` (`name`, `required`, `requiredMessage`), `FieldAdapterActions<Value>` and `FieldAdapterActionsContext<Value>` (the `actions` prop), and `<Adapter>Props` for each adapter.

Specific to React Final Form:

| Export                 | Purpose                                                                                         |
| ---------------------- | ----------------------------------------------------------------------------------------------- |
| `focusOnError`         | Form decorator: focuses the first field with an error, in document order, when submitting fails |
| `FinalFormFieldConfig` | The `useField` configuration the adapters accept                                                |

## Experimental

Like `@dextinity/ui`, any export may change or be removed at any time, without deprecation notice. Changesets are not created for changes within this package.

## Conventions

The package follows the [component conventions of `@dextinity/ui`](../ui/README.md#component-conventions) where they apply: TSDoc on every export and prop, props as `<Name>Props` interfaces, named exports, components wrapped in `forwardRef`. The adapters render no elements of their own, so they have no styles, slots, or owner state.

## Stories and tests

The stories live in `src/**/__stories__/` and are shown in the Storybook of `@dextinity/ui`, under `Forms/Final Form`, with a complete edit page as `Example form`; run them with `pnpm run test:storybook` in `packages/ui`. Unit tests (`pnpm run test:unit`, `jsdom`) cover the value and error mapping.
