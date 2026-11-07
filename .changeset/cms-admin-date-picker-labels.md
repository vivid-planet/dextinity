---
"@dextinity/cms-admin": minor
---

Add `useDatePickerLabels`, `useDateTimePickerLabels` and `useDateRangePickerLabels`

They return translated `labels` for the date pickers of `@dextinity/ui` and their form fields, including the messages for typed text that isn't a date or time, or lies outside `min` and `max`:

```tsx
const dateTimePickerLabels = useDateTimePickerLabels();

<DateTimeField name="publishedAt" label="Published at" locale={intl.locale} labels={dateTimePickerLabels} />;
```
