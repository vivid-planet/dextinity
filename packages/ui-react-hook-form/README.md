# @dextinity/ui-react-hook-form

An **experimental** adapter package that connects the form controls of [`@dextinity/ui`](../ui/README.md) to [React Hook Form](https://react-hook-form.com/). `@dextinity/ui` stays free of form logic: its fields are plain controlled components, and each adapter here binds one of them to a field of a `useForm` form through `useController`.

[`@dextinity/ui-react-final-form`](../ui-react-final-form/README.md) offers the same adapters for React Final Form, with the same names and the same field-level props, so switching libraries is a matter of imports and the library-specific configuration props.

## Usage

```tsx
import { Button, SaveState } from "@dextinity/ui";
import { InputField, SelectField, SwitchField, useFormSaveState } from "@dextinity/ui-react-hook-form";
import { useForm } from "react-hook-form";

function PageForm({ page }: { page: PageFormValues }) {
    const { control, handleSubmit, reset } = useForm<PageFormValues>({ defaultValues: page, mode: "onTouched" });
    const saveState = useFormSaveState({ control });

    const save = handleSubmit(async (values) => {
        await savePage(values);
        reset(values);
    });

    return (
        <form onSubmit={save} noValidate>
            <SaveState {...saveState} />
            <InputField control={control} name="title" label="Title" required />
            <SelectField control={control} name="category" label="Category" options={categories} />
            <SwitchField control={control} name="published">
                Published
            </SwitchField>
            <Button type="submit">Save</Button>
        </form>
    );
}
```

- **`mode: "onTouched"`** validates a field when it's left and again on every change after that, which is when the adapters show errors (see [Validation](#validation)) and what the React Final Form adapters do. With React Hook Form's default `onSubmit` mode, errors appear only after the first submit.
- **`noValidate`** on the `<form>`: the adapters validate `required` themselves and show the message in the field, so the browser's own validation bubbles would only get in the way.
- **`control`** is optional: inside a `FormProvider`, the adapters take the form from the context. Passing it types `name` against the form values.

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
- **`onFocus`** — still passed through.
- Every other prop of the ui component passes through unchanged. `value`/`checked`, `onChange`, `onBlur`, `state`, and `validationMessage` are not available: the adapter sets them from the field.

`CheckboxField` with a `value` is one box of a group: the field holds the list of the checked boxes' values.

### Value mapping

An empty form value (`undefined` or `null`, e.g. a field without a default value) maps to the control's empty state: `""` for text, `null` (or `[]` with `multiple`) for `SelectField`, unchecked for `CheckboxField` and `SwitchField`, no pressed option for `SegmentedControlField`, `min` for `SliderField`, and the center for `FocalPointPickerField`. The adapters write the control's value back unchanged; convert other types in the form's `defaultValues` and submit handler.

### Validation

A field shows its error once it was touched (blurred) or the form was submitted: `state="error"` with the message as `validationMessage`. An error set with `setError` after submitting (e.g. from the server) shows the same way until the field changes and validates again. Controls without a field frame – `CheckboxField`, `SwitchField`, `SegmentedControlField`, `SliderField`, and `FocalPointPickerField` – show it below the control, the same way.

When submitting fails validation, React Hook Form focuses the first invalid field (`shouldFocusError`, on by default). The adapters register the element to focus inside the ui component – the input, the select trigger, the editor, or the checkbox – since not every ui component's root takes focus. Pass `{ shouldFocus: true }` to `setError` to focus a field with a server error.

### React Hook Form configuration

Each adapter takes the field configuration of `useController`, typed as `ReactHookFormFieldConfig<TFieldValues, TName>`:

- **`control`** — the form's `control`; defaults to the one of the surrounding `FormProvider`.
- **`rules`** — validation rules as in `register` (`validate`, `pattern`, `min`, `maxLength`, …). `required` adds its check in front of them; a `required` rule without a message shows `requiredMessage`, any other rule without a message marks the field invalid without a text.
- **`defaultValue`** and **`shouldUnregister`** — as in `useController`.

The adapters are generic in the form values and the field's path, `<TFieldValues, TName extends FieldPath<TFieldValues>>`, like `useController`: with a typed `control`, or with `<InputField<PageFormValues> … />` inside a `FormProvider`, `name` must be a path of the form values. `SelectField` and `SegmentedControlField` take their own value type parameter first, as in `@dextinity/ui`.

## Form helpers

Shared by both adapter packages, for the content of a form:

| Export                   | Purpose                                                                                                                                    |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `useFormSaveState()`     | `{ state, savedAt }` for `SaveState`: `saving` while submitting, `error` after a failed submit, `dirty` with unsaved changes, else `saved` |
| `useHasUnsavedChanges()` | Whether the form has changes that are not saved, e.g. to ask with a `ConfirmDialog` before leaving                                         |

Both take an optional `{ control }` (`FormStateHookOptions`) and use the surrounding `FormProvider` without it. A successful submit counts as saved even if the form keeps its default values; calling `reset(values)` after saving is still the usual way to make the saved values the new baseline. React Hook Form doesn't tell a submit blocked by validation from one whose handler failed or called `setError`, so both report `error` until the next change.

Shared types: `FieldAdapterBaseProps` (`name`, `required`, `requiredMessage`), `FieldAdapterActions<Value>` and `FieldAdapterActionsContext<Value>` (the `actions` prop), and `<Adapter>Props` for each adapter.

Specific to React Hook Form:

| Export                     | Purpose                                               |
| -------------------------- | ----------------------------------------------------- |
| `ReactHookFormFieldConfig` | The `useController` configuration the adapters accept |
| `FormStateHookOptions`     | The `{ control }` option of the form helpers          |

## Experimental

Like `@dextinity/ui`, any export may change or be removed at any time, without deprecation notice. Changesets are not created for changes within this package.

## Conventions

The package follows the [component conventions of `@dextinity/ui`](../ui/README.md#component-conventions) where they apply: TSDoc on every export and prop, props as `<Name>Props` interfaces, named exports, components wrapped in `forwardRef`. The adapters render no elements of their own, so they have no styles, slots, or owner state.

## Stories and tests

The stories live in `src/**/__stories__/` and are shown in the Storybook of `@dextinity/ui`, under `Forms/React Hook Form`, with a complete edit page as `Example form`; run them with `pnpm run test:storybook` in `packages/ui`. Unit tests (`pnpm run test:unit`, `jsdom`) cover the value and error mapping.
