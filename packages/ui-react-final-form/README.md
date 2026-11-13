# @dextinity/ui-react-final-form

An **experimental** adapter package that connects the form controls of [`@dextinity/ui`](../ui/README.md) to [React Final Form](https://final-form.org/react). `@dextinity/ui` stays free of form logic: its fields are plain controlled components, and each adapter here binds one of them to a field of the surrounding `<Form>`.

[`@dextinity/ui-react-hook-form`](../ui-react-hook-form/README.md) offers the same adapters for React Hook Form, with the same names and the same field-level props, so switching libraries is a matter of imports and the library-specific configuration props. Every form built with `@dextinity/ui` binds its fields through one of the two packages.

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

| Adapter                 | ui component       | Form value                                                                | Controlled props it takes over                                        |
| ----------------------- | ------------------ | ------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| `InputField`            | `Field` + `Input`  | `string`                                                                  | `name`, `value`, `onChange`, `onBlur`, `state`, `validationMessage`   |
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
- **`onFocus`** — still passed through, called after the adapter's own handler.
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

An empty form value (`undefined`, or `""` from React Final Form's default `format`) maps to the control's empty state: `""` for text, `null` (or `[]` with `multiple`) for `SelectField` and `ComboboxField`, `null` for `PickerField`, `null` for `NumberField`, `DateField`, `DateTimeField`, and `DateRangeField`, unchecked for `CheckboxField` and `SwitchField`, no chosen option for `RadioGroupField`, `[]` for `CheckboxGroupField`, no pressed option for `SegmentedControlField`, `min` for `SliderField`, and the center for `FocalPointPickerField`. The adapters write the control's value back unchanged; use `parse` and `format` to convert, e.g. a number entered in an `InputField`.

For the dirty check, the adapters treat `undefined`, `null`, and `""` as equal: React Final Form turns a cleared text into `undefined`, so a field whose initial value is `""` or `null` would otherwise stay dirty after emptying it again, and the form "unsaved". `RichTextEditorField` also counts markup without visible text as empty. Pass `isEqual` to compare differently.

`SelectField` and `ComboboxField` compare values by key for the dirty check (`getKey`, `getOptionKey`; an option's `id` by default for `ComboboxField`), so options chosen again as new objects or in a new list don't make the form dirty. Pass `isEqual` to compare differently; with `parse` or `format`, the comparison treating empty values as equal applies unless you pass one.

### Validation

By default, a field shows its error once it was touched (blurred) or the form was submitted (see [When messages show](#when-messages-show)): `state="error"` with the message as `validationMessage`. A submit error for the field (returned from `onSubmit`) shows the same way until the field changes. Every adapter renders its control in a `Field` with `label`, `required`, `helperText`, `helpText`, and the message, so the message shows below the control for every field, including the group fields – `CheckboxField`, `SwitchField`, `RadioGroupField`, `CheckboxGroupField`, `SegmentedControlField`, `SliderField`, `FileUploadField`, and `FocalPointPickerField` – which use `layout="group"`.

To focus the first field with an error when submitting fails, in document order, add the `focusOnError` decorator to the `<Form>`: `decorators={[focusOnError]}`. React Final Form has no focus on error of its own. The boxes of a checkbox group count as one field, focused at the first box.

#### Warnings

A warning points out something to check without blocking submitting, e.g. a title longer than recommended. The field shows it as `state="warning"`; an error shown at the same time wins. Two sources:

- **`warn`** on the adapter, for a rule on the field's own value: `<InputField name="title" label="Title" warn={(title) => (title?.length > 60 ? "Longer than recommended" : undefined)} />`.
- **`meta.data.warning`**, React Final Form's convention for warnings, for anything else: a rule across fields or a hint from the server. Set it with a mutator, e.g. `setFieldData` of `final-form-set-field-data`, from a decorator or an effect. It takes precedence over `warn`.

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

### Field arrays and conditional groups

The adapters take any path as `name`, so rows of fields and groups shown on a condition need nothing special:

- **Rows**, e.g. a list of addresses: render one set of adapters per item with names like `addresses[1].street`, keyed by a stable id, not the index. Add and remove items with `form.change`, or with `FieldArray` and the `push`/`remove` mutators of `react-final-form-arrays`, which also move the touched and error states with the rows.
- **Conditional groups**: an unmounted adapter stops validating, so a hidden required field doesn't block submitting. Its value stays in the form values; remove it in `onSubmit` (or with `form.change(name, undefined)`) when hidden values must not be saved.

The story `Field arrays` shows both.

### React Final Form configuration

Each adapter takes the field configuration of `useField`, typed as `FinalFormFieldConfig<FieldValue, ControlValue>`: `validate`, `validateFields`, `parse`, `format`, `formatOnBlur`, `initialValue`, `defaultValue`, `isEqual`, `allowNull`, `data`, `beforeSubmit`, and `afterSubmit`. The adapters are generic in the form value, `FieldValue`, which defaults to the control's value; `parse` and `format` convert between the two. `SliderField` and `NumberField` keep the ui component's own `format` (number formatting) and leave out React Final Form's.

## Form helpers

Shared by both adapter packages, for the content of a form:

| Export                       | Purpose                                                                                                                                    |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `FieldAdapterConfigProvider` | When the adapters inside it show errors and warnings (`showErrors`, `showWarnings`): once touched or submitted, or always                  |
| `useFormSaveState()`         | `{ state, savedAt }` for `SaveState`: `saving` while submitting, `error` after a failed submit, `dirty` with unsaved changes, else `saved` |
| `useHasUnsavedChanges()`     | Whether the form has changes that are not saved, e.g. to ask with a `ConfirmDialog` before leaving                                         |

A successful submit counts as saved even if the form keeps its initial values. Changes made while a save is running count as unsaved. A submit counts as failed when `onSubmit` returns submit errors, and reports `error` until the next change; a submit blocked by validation errors doesn't change the state.

Shared types: `FieldAdapterBaseProps` (`name`, `required`, `requiredMessage`), `FieldAdapterConfig`, `FieldAdapterConfigProviderProps`, and `FieldMessageTiming` (the provider), `FieldAdapterActions<Value>` and `FieldAdapterActionsContext<Value>` (the `actions` prop), and `<Adapter>Props` for each adapter.

Specific to React Final Form:

| Export                 | Purpose                                                                                         |
| ---------------------- | ----------------------------------------------------------------------------------------------- |
| `focusOnError`         | Form decorator: focuses the first field with an error, in document order, when submitting fails |
| `FinalFormFieldConfig` | The `useField` configuration the adapters accept                                                |

## Experimental

Like `@dextinity/ui`, any export may change or be removed at any time, without deprecation notice. Changesets are not created for changes within this package.

## Conventions

The package follows the [component conventions of `@dextinity/ui`](../ui/README.md#component-conventions) where they apply: TSDoc on every export and prop, props as `<Name>Props` interfaces, named exports, components wrapped in `forwardRef`. The adapters render no elements of their own, so they have no styles, slots, or owner state.

## Structure

| Folder                    | Contents                                                                                                                                      |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/fields/<fieldName>/` | One folder per adapter, e.g. `src/fields/inputField/InputField.tsx`, with its `__stories__/` and `__tests__/`                                 |
| `src/fieldAdapter/`       | The plumbing all adapters share: `useFieldAdapter` on `useField`, the shared props, splitting them from the ui props, and rendering `actions` |
| `src/fieldAdapterConfig/` | `FieldAdapterConfigProvider`, which configures every adapter inside it                                                                        |
| `src/focusOnError/`       | The `focusOnError` decorator that focuses the first invalid field after a failed submit                                                       |
| `src/formState/`          | The form helpers `useFormSaveState` and `useHasUnsavedChanges`                                                                                |
| `src/utils/`              | Small helpers without form logic                                                                                                              |
| `src/storybook/`          | `FinalFormStoryFrame` and sample data, used by the stories only and not exported                                                              |
| `src/__stories__/`        | Stories spanning several adapters: `Example form` and `Field arrays`                                                                          |

A new adapter gets its own folder in `src/fields/` and its export in `src/index.ts`.

## Stories and tests

The stories live in `src/**/__stories__/` and are shown in this package's own Storybook (`pnpm run storybook`), with a complete edit page as `Example form` and the adapters under `Fields`. It renders them with the built `@dextinity/ui` (`lib/` and its styles) inside its `Theme`; the toolbar switches the color scheme and density. The root Storybook (`storybook/`) composes it as `@dextinity/ui-react-final-form`. Run the stories as tests with `pnpm run test:storybook`. Unit tests (`pnpm run test:unit`, `jsdom`) in each adapter's `__tests__/` folder cover the value and error mapping.
