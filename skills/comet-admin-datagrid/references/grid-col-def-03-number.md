# Column: Number

## Plain (Int / Float)

```tsx
{
    field: "soldCount",
    headerName: intl.formatMessage({ id: "product.soldCount", defaultMessage: "Sold Count" }),
    type: "number",
    width: 120,
}
```

## Currency (assume EUR unless unclear, then ask user)

```tsx
{
    field: "price",
    renderHeader: () => (
        <>
            <GridColumnHeaderTitle label={intl.formatMessage({ id: "product.price", defaultMessage: "Price" })} columnWidth={150} />
            <Tooltip title={<FormattedMessage id="product.price.tooltip" defaultMessage="Price in EUR" />}>
                <InfoIcon sx={{ marginLeft: 1 }} />
            </Tooltip>
        </>
    ),
    headerName: intl.formatMessage({ id: "product.price", defaultMessage: "Price" }),
    type: "number",
    renderCell: ({ value }) => {
        return typeof value === "number" ? (
            <FormattedNumber value={value} style="currency" currency="EUR" minimumFractionDigits={2} maximumFractionDigits={2} />
        ) : (
            ""
        );
    },
    flex: 1,
}
```

## Rules

- Currency columns use `renderHeader` with a tooltip indicating the currency
- Use `FormattedNumber` from `react-intl` for currency formatting
