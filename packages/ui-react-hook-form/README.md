# @dextinity/ui-react-hook-form

An **experimental** adapter package that connects the form controls of [`@dextinity/ui`](../ui/README.md) to [React Hook Form](https://react-hook-form.com/). `@dextinity/ui` stays free of form logic: its fields are plain controlled components, and each adapter here binds one of them to a field of a `useForm` form through `useController`.

[`@dextinity/ui-react-final-form`](../ui-react-final-form/README.md) offers the same adapters for React Final Form, with the same names and the same field-level props, so switching libraries is a matter of imports and the library-specific configuration props. Every form built with `@dextinity/ui` binds its fields through one of the two packages.

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

| Adapter                 | ui component       | Form value                                                                | Controlled props it takes over                                        |
| ----------------------- | ------------------ | ------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| `InputField`            | `TextField`        | `string`                                                                  | `name`, `value`, `onChange`, `onBlur`, `state`, `validationMessage`   |
| `TextareaField`         | `Textarea`         | `string`                                                                  | `name`, `value`, `onChange`, `onBlur`, `state`, `validationMessage`   |
| `SelectField`           | `Select`           | an option's value (`string` by default) or `null`, a list with `multiple` | `name`, `value`, `onChange`, `onBlur`, `state`, `validationMessage`   |
| `ComboboxField`         | `Combobox`         | the chosen option itself or `null`, a list with `multiple`                | `name`, `value`, `onChange`, `onBlur`, `state`, `validationMessage`   |
| `PickerField`           | `Picker`           | the value set by the application's picker, `null` for none                | `value`, `onOpen`, `onClear`, `onBlur`, `state`, `validationMessage`  |
| `NumberField`           | `NumberInput`      | `number \| null`                                                          | `name`, `value`, `onChange`, `onBlur`, `state`, `validationMessage`   |
| `DateField`             | `DatePicker`       | a day as `YYYY-MM-DD`, `null` for none                                    | `name`, `value`, `onChange`, `onBlur`, `state`, `validationMessage`   |
| `DateTimeField`         | `DateTimePicker`   | an ISO 8601 date-time, `null` for none                                    | `name`, `value`, `onChange`, `onBlur`, `state`, `validationMessage`   |
| `DateRangeField`        | `DateRangePicker`  | `{ start, end }` of days, `null` for none                                 | `name`, `value`, `onChange`, `onBlur`, `state`, `validationMessage`   |
| `RichTextEditorField`   | `RichTextEditor`   | `string` (HTML)                                                           | `name`, `value`, `onChange`, `onBlur`, `state`, `validationMessage`   |
| `CheckboxField`         | `Checkbox`         | `boolean`, or `string[]` when the checkbox has a `value`                  | `name`, `checked`, `onChange`, `onBlur`, `state`, `validationMessage` |
| `SwitchField`           | `Switch`           | `boolean`                                                                 | `name`, `checked`, `onChange`, `onBlur`, `state`, `validationMessage` |
| `RadioGroupField`       | `RadioGroup`       | one of the options' values, `null` for none                               | `name`, `value`, `onChange`, `onBlur`, `state`, `validationMessage`   |
| `CheckboxGroupField`    | `CheckboxGroup`    | the checked options' values (`string[]`)                                  | `name`, `value`, `onChange`, `onBlur`, `state`, `validationMessage`   |
| `SegmentedControlField` | `SegmentedControl` | one of the options' values                                                | `value`, `onChange`, `onBlur`, `state`, `validationMessage`           |
| `SliderField`           | `Slider`           | `number`                                                                  | `name`, `value`, `onChange`, `onBlur`, `state`, `validationMessage`   |
| `FocalPointPickerField` | `FocalPointPicker` | `FocalPoint` (`{ x, y }`)                                                 | `value`, `onChange`, `onBlur`, `state`, `validationMessage`           |

`Dropzone` (uploads, no value), `ScopeSwitcher` (navigation), and `CopyField` (read-only) have no adapter.

### Props contract

Shared by both adapter packages:

- **`name`** — the field's path in the form values, e.g. `title` or `seo.description`. It is also passed to the ui component where it takes one.
- **`required`** — marks the field where the ui component supports it (star and `aria-required` on the framed fields, `CheckboxField`, `SwitchField`, and `RadioGroupField`; the star alone on `CheckboxGroupField`, as a group of checkboxes has no required state) and validates it: empty string, `null`/`undefined`, `false`, and an empty list are missing; for `RichTextEditorField`, markup without visible text is missing; for `DateRangeField`, a range without both ends is missing. A custom validation still runs on a non-empty value.
- **`requiredMessage`** — the message for a missing required value. Defaults to `"Required"`; pass a translated text.
- **`actions`** (`InputField`, `TextareaField`, `SelectField`, `ComboboxField`, `PickerField`, `RichTextEditorField`) — content at the label as in the ui component, or a function `({ value, setValue }) => ReactNode` to connect `FieldActions`, e.g. `actions={({ setValue }) => <FieldActions aiAssist onAiSuggest={suggest} onAiAccept={setValue} />}`.
- **`warn`** — `(value) => ReactNode`: a warning for the field's value, shown as `state="warning"` with the message as `validationMessage`. It never blocks submitting, and an error wins over it. See [Validation](#validation).
- **`ref`** — forwarded to the ui component, so it reaches the same element as on the component itself.
- **`onFocus`** — still passed through.
- Every other prop of the ui component passes through unchanged. `value`/`checked`, `onChange`, `onBlur`, `state`, and `validationMessage` are not available: the adapter sets them from the field.

`CheckboxField` with a `value` is one box of a group: the field holds the list of the checked boxes' values.

`PickerField` opens the picker the application provides: `renderPicker({ open, value, onChange, onClose })` renders it, e.g. a dialog with the page tree, and `onChange` sets the field's value and closes it. `onOpen({ value, setValue })` is called as well, for a picker opened elsewhere. The field counts as touched once the picker closes. `clearable` (default: unless `required`) shows the clear button, which sets `null` (`[]` for a list).

```tsx
<PickerField
    name="target"
    label="Link target"
    renderValue={(page) => page.name}
    renderPicker={({ open, value, onChange, onClose }) => <PagePickerDialog open={open} value={value} onChange={onChange} onClose={onClose} />}
/>
```

### Value mapping

An empty form value (`undefined` or `null`, e.g. a field without a default value) maps to the control's empty state: `""` for text, `null` (or `[]` with `multiple`) for `SelectField` and `ComboboxField`, `null` for `PickerField`, `null` for `NumberField`, `DateField`, `DateTimeField`, and `DateRangeField`, unchecked for `CheckboxField` and `SwitchField`, no chosen option for `RadioGroupField`, `[]` for `CheckboxGroupField`, no pressed option for `SegmentedControlField`, `min` for `SliderField`, and the center for `FocalPointPickerField`. The adapters write the control's value back unchanged; convert other types in the form's `defaultValues` and submit handler.

Emptying a field again keeps it pristine: when `InputField`, `TextareaField`, `RichTextEditorField`, `NumberField`, `DateField`, or `DateTimeField` is emptied (`""`, `null`; markup without visible text for rich text) and its default value is empty too, the adapter writes the default value back, e.g. `null` from the API rather than `""`. A field missing from `defaultValues` counts as pristine while it's empty: if its parent object has default values (the form itself, or an existing field array row), the adapters give it an empty entry there, and the control's empty value once it's set to that, e.g. `false` for an unchecked `CheckboxField`, since React Hook Form compares all form values with the default values to tell whether the form is dirty.

React Hook Form compares the values as they are, including their type, so a default value only counts as unchanged when it has the type the control writes back: e.g. `defaultValues: { price: 10 }` with an `InputField` turns dirty once edited, even back to `10`, since the field writes the string `"10"`. Convert such values in `defaultValues` (and back in the submit handler), or use the adapter for that type, here `NumberField`. Giving every field a default value of the right type, as React Hook Form recommends, avoids both.

### Validation

By default, a field shows its error once it was touched (blurred) or the form was submitted (see [When messages show](#when-messages-show)): `state="error"` with the message as `validationMessage`. An error set with `setError` after submitting (e.g. from the server) shows the same way until the field changes and validates again. Controls without a field frame – `CheckboxField`, `SwitchField`, `RadioGroupField`, `CheckboxGroupField`, `SegmentedControlField`, `SliderField`, and `FocalPointPickerField` – show it below the control, the same way.

When submitting fails validation, React Hook Form focuses the first invalid field (`shouldFocusError`, on by default). The adapters register the element to focus inside the ui component – the input, the select trigger, the editor, or the checkbox – since not every ui component's root takes focus. Pass `{ shouldFocus: true }` to `setError` to focus a field with a server error.

#### Warnings

A warning points out something to check without blocking submitting, e.g. a title longer than recommended. The field shows it as `state="warning"`; an error shown at the same time wins. React Hook Form has no warnings of its own (an error set with `setError` blocks submitting), so the convention is the adapters' `warn` prop:

- For a rule on the field's own value: `<InputField name="title" label="Title" warn={(title) => (title?.length > 60 ? "Longer than recommended" : undefined)} />`.
- For anything else, e.g. a rule across fields or a hint from the server, derive the warning in the form, e.g. with `useWatch` or `useFormState`, and return it: `warn={() => slugWarning}`.

#### When messages show

By default, errors and warnings show once the field was touched or the form was submitted. Wrap forms or a part of one in `FieldAdapterConfigProvider` to change that:

```tsx
<FieldAdapterConfigProvider showErrors="always" showWarnings="always">
    <BlockForm />
</FieldAdapterConfigProvider>
```

- **`showErrors`** — `"touched-or-submitted"` (default) or `"always"`. Use `"always"` for forms that save on every change, e.g. block forms in an editor, where no submit reveals the errors.
- **`showWarnings`** — the same, for warnings.

A nested provider overrides the settings it sets and inherits the others.

With `showErrors="always"`, an error shows as soon as React Hook Form has it, which depends on the form's `mode`: use `mode: "all"` and call `trigger()` after mounting to validate the initial values too.

### Field arrays and conditional groups

The adapters take any path as `name`, checked against the form values' type, so rows of fields and groups shown on a condition need nothing special:

- **Rows**, e.g. a list of addresses: use React Hook Form's `useFieldArray`, render one set of adapters per row with names like `addresses.1.street`, and key the rows by the `id` it provides, not the index. `append`, `remove`, and `move` keep the touched and error states with the rows.
- **Conditional groups**: an unmounted adapter keeps its value and its rules don't run. Pass `shouldUnregister` to the adapters of a group to remove their values while it's hidden.

The story `Field arrays` shows both.

### React Hook Form configuration

Each adapter takes the field configuration of `useController`, typed as `ReactHookFormFieldConfig<TFieldValues, TName>`:

- **`control`** — the form's `control`; defaults to the one of the surrounding `FormProvider`.
- **`rules`** — validation rules as in `register` (`validate`, `pattern`, `min`, `maxLength`, …). `required` adds its check in front of them; a `required` rule without a message shows `requiredMessage`, any other rule without a message marks the field invalid without a text.
- **`defaultValue`** and **`shouldUnregister`** — as in `useController`.

The adapters are generic in the form values and the field's path, `<TFieldValues, TName extends FieldPath<TFieldValues>>`, like `useController`: with a typed `control`, or with `<InputField<PageFormValues> … />` inside a `FormProvider`, `name` must be a path of the form values. `SelectField`, `SegmentedControlField`, `RadioGroupField`, and `CheckboxGroupField` take their own value type parameter first, as in `@dextinity/ui`.

## Form helpers

Shared by both adapter packages, for the content of a form:

| Export                       | Purpose                                                                                                                                    |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `FieldAdapterConfigProvider` | When the adapters inside it show errors and warnings (`showErrors`, `showWarnings`): once touched or submitted, or always                  |
| `useFormSaveState()`         | `{ state, savedAt }` for `SaveState`: `saving` while submitting, `error` after a failed submit, `dirty` with unsaved changes, else `saved` |
| `useHasUnsavedChanges()`     | Whether the form has changes that are not saved, e.g. to ask with a `ConfirmDialog` before leaving                                         |

The hooks take an optional `{ control }` (`FormStateHookOptions`) and use the surrounding `FormProvider` without it. A successful submit counts as saved even if the form keeps its default values; calling `reset(values)` after saving is still the usual way to make the saved values the new baseline, with `{ keepDirtyValues: true }` to keep what was typed while saving. Changes made while a save is running count as unsaved. React Hook Form doesn't tell a submit blocked by validation from one whose handler failed or called `setError`, so both report `error` until the next change.

Shared types: `FieldAdapterBaseProps` (`name`, `required`, `requiredMessage`), `FieldAdapterConfig`, `FieldAdapterConfigProviderProps`, and `FieldMessageTiming` (the provider), `FieldAdapterActions<Value>` and `FieldAdapterActionsContext<Value>` (the `actions` prop), and `<Adapter>Props` for each adapter.

Specific to React Hook Form:

| Export                     | Purpose                                               |
| -------------------------- | ----------------------------------------------------- |
| `ReactHookFormFieldConfig` | The `useController` configuration the adapters accept |
| `FormStateHookOptions`     | The `{ control }` option of the form helpers          |

## Experimental

Like `@dextinity/ui`, any export may change or be removed at any time, without deprecation notice. Changesets are not created for changes within this package.

## Conventions

The package follows the [component conventions of `@dextinity/ui`](../ui/README.md#component-conventions) where they apply: TSDoc on every export and prop, props as `<Name>Props` interfaces, named exports, components wrapped in `forwardRef`. The adapters render no elements of their own, so they have no styles, slots, or owner state.

## Structure

| Folder                    | Contents                                                                                                                                           |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/fields/<fieldName>/` | One folder per adapter, e.g. `src/fields/inputField/InputField.tsx`, with its `__stories__/` and `__tests__/`                                      |
| `src/fieldAdapter/`       | The plumbing all adapters share: `useFieldAdapter` on `useController`, the shared props, splitting them from the ui props, and rendering `actions` |
| `src/fieldAdapterConfig/` | `FieldAdapterConfigProvider`, which configures every adapter inside it                                                                             |
| `src/formState/`          | The form helpers `useFormSaveState` and `useHasUnsavedChanges`                                                                                     |
| `src/utils/`              | Small helpers without form logic                                                                                                                   |
| `src/storybook/`          | `ReactHookFormStoryFrame` and sample data, used by the stories only and not exported                                                               |
| `src/__stories__/`        | Stories spanning several adapters: `Example form` and `Field arrays`                                                                               |

A new adapter gets its own folder in `src/fields/` and its export in `src/index.ts`.

## Stories and tests

The stories live in `src/**/__stories__/` and are shown in this package's own Storybook (`pnpm run storybook`), with a complete edit page as `Example form` and the adapters under `Fields`. It renders them with the built `@dextinity/ui` (`lib/` and its styles) inside its `Theme`; the toolbar switches the color scheme and density. The root Storybook (`storybook/`) composes it as `@dextinity/ui-react-hook-form`. Run the stories as tests with `pnpm run test:storybook`. Unit tests (`pnpm run test:unit`, `jsdom`) in each adapter's `__tests__/` folder cover the value and error mapping.
