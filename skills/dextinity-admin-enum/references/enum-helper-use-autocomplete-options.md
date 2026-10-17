# Helper: useAutocompleteOptions

Converts a `MessageDescriptorMap` (from a translatable enum) to an array of `{ value, label }` options for AutocompleteField. Search for it in the project.

Create this file if it does not exist.

```ts
import { useIntl, type MessageDescriptor } from "react-intl";
import { useMemo } from "react";

type AutocompleteOption<T extends string> = {
    value: T;
    label: string;
};

export function useAutocompleteOptions<T extends string>(messageDescriptorMap: Record<T, MessageDescriptor>): Array<AutocompleteOption<T>> {
    const intl = useIntl();

    return useMemo(
        () =>
            (Object.entries(messageDescriptorMap) as Array<[T, MessageDescriptor]>).map(([value, descriptor]) => ({
                value,
                label: intl.formatMessage(descriptor),
            })),
        [intl, messageDescriptorMap],
    );
}
```
