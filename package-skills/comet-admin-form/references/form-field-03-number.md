# Number / Int / Float Field

## Component

```tsx
<NumberField
    required // if non-nullable in schema
    variant="horizontal"
    fullWidth
    name="price"
    label={<FormattedMessage id="<entityName>.price" defaultMessage="Price" />}
/>
```

## Currency fields

When a number field represents a price, cost, or any monetary value (e.g. field names like `price`, `purchasePrice`, `cost`, `amount`, `fee`, `budget`, `revenue`), add a currency adornment. Default to `€` (EUR) unless the user specifies a different currency.

```tsx
import { InputAdornment } from "@mui/material";

<NumberField
    variant="horizontal"
    fullWidth
    name="purchasePrice"
    label={<FormattedMessage id="<entityName>.purchasePrice" defaultMessage="Purchase Price" />}
    endAdornment={<InputAdornment position="end">€</InputAdornment>}
/>;
```

## Nested object (dot notation)

```tsx
<NumberField
    required
    variant="horizontal"
    fullWidth
    name="dimensions.width"
    label={<FormattedMessage id="<entityName>.width" defaultMessage="Width" />}
/>
```

## Rules

- Import `NumberField` from `@comet/admin`
- Use dot notation for nested object fields (e.g. `dimensions.width`)
- **Currency fields**: When a number field is tentatively a currency/price (based on field name or context), always add an `endAdornment` with the currency symbol. Use `€` as default, ask the user if unclear.
- For other units (weight, distance, percentage), also consider adding an appropriate `endAdornment` (e.g. `kg`, `m`, `%`)
