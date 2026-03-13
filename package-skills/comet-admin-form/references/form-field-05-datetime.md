# DateTime / LocalDate Fields

## Read-only / audit (createdAt, updatedAt)

```tsx
import { Lock } from "@comet/admin-icons";
import { InputAdornment } from "@mui/material";

<Future_DatePickerField
    readOnly
    disabled
    endAdornment={
        <InputAdornment position="end">
            <Lock />
        </InputAdornment>
    }
    variant="horizontal"
    fullWidth
    name="createdAt"
    label={<FormattedMessage id="<entityName>.createdAt" defaultMessage="Created At" />}
/>;
```

## Editable DateTime

```tsx
<Future_DateTimePickerField
    variant="horizontal"
    fullWidth
    name="lastCheckedAt"
    label={<FormattedMessage id="<entityName>.lastCheckedAt" defaultMessage="Last Checked At" />}
/>
```

Requires type transformation in `FormValues` (`Date | null`) and in `handleSubmit` (`.toISOString()`).

## Editable LocalDate

```tsx
<Future_DatePickerField
    variant="horizontal"
    fullWidth
    name="availableSince"
    label={<FormattedMessage id="<entityName>.availableSince" defaultMessage="Available Since" />}
/>
```

## Rules

- Import `Future_DatePickerField` and `Future_DateTimePickerField` from `@comet/admin`
- **Editable DateTime** requires transformations:
    - `FormValues` type: `Omit<..., "lastCheckedAt"> & { lastCheckedAt?: Date | null }`
    - `initialValues`: `new Date(data.<entityName>.lastCheckedAt)`
    - `handleSubmit` output: `formValues.lastCheckedAt ? formValues.lastCheckedAt.toISOString() : null`
- **LocalDate** does not need type transformation
- **Read-only** fields (audit timestamps) should strip the field from `handleSubmit` output: `createdAt: undefined`
