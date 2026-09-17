# Helper: recordToOptions

Converts a `Record<EnumValue, ReactNode>` to an options array for SelectField/RadioGroupField/CheckboxListField. Search for it in the project.

Create this file if it does not exist.

```ts
import { type ReactNode } from "react";

type Option<T extends string> = {
    value: T;
    label: ReactNode;
};

export function recordToOptions<T extends string>(record: Record<T, ReactNode>): Array<Option<T>> {
    return (Object.entries(record) as Array<[T, ReactNode]>).map(([value, label]) => ({
        value,
        label,
    }));
}
```
