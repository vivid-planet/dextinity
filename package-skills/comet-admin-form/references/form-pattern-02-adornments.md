# Field Adornments

Start and end adornments can be added to text, number, and date fields to show icons, units, or other contextual information.

## Pattern

```tsx
import { InputAdornment } from "@mui/material";
import { Euro, Lock } from "@comet/admin-icons";

{
    /* Unit adornment */
}
<NumberField
    required
    variant="horizontal"
    fullWidth
    name="weight"
    label={<FormattedMessage id="<entityName>.weight" defaultMessage="Weight" />}
    endAdornment={<InputAdornment position="end">kg</InputAdornment>}
/>;

{
    /* Icon adornment */
}
<NumberField
    required
    variant="horizontal"
    fullWidth
    name="price"
    label={<FormattedMessage id="<entityName>.price" defaultMessage="Price" />}
    startAdornment={
        <InputAdornment position="start">
            <Euro />
        </InputAdornment>
    }
/>;

{
    /* Read-only field with lock icon */
}
<TextField
    readOnly
    disabled
    variant="horizontal"
    fullWidth
    name="slug"
    label={<FormattedMessage id="<entityName>.slug" defaultMessage="Slug" />}
    endAdornment={
        <InputAdornment position="end">
            <Lock />
        </InputAdornment>
    }
/>;
```

## Rules

- Import `InputAdornment` from `@mui/material`
- Import icons from `@comet/admin-icons`
- Supported on: `TextField`, `TextAreaField`, `NumberField`, `Future_DatePickerField`, `Future_DateTimePickerField`
- Use `startAdornment` for currency symbols or prefixes
- Use `endAdornment` for units (kg, cm, %) or status icons (Lock for read-only)
- Read-only fields should combine `readOnly`, `disabled`, and a `<Lock />` end adornment
