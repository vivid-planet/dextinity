# Helper: createTranslatableEnum

Core factory function that all translatable enums use. Search for it in the project.

Create this file if it does not exist.

```tsx
import type { FunctionComponent, ReactNode } from "react";
import { FormattedMessage, type MessageDescriptor } from "react-intl";

type ComponentProps<T extends string> = {
    value: T;
};
type TranslatableEnumResult<T extends string> = {
    Component: FunctionComponent<ComponentProps<T>>;
    messageDescriptorMap: Record<T, MessageDescriptor>;
    formattedMessageMap: Record<T, ReactNode>;
};

export function createTranslatableEnum<T extends string>(messageDescriptorMap: Record<T, MessageDescriptor>): TranslatableEnumResult<T> {
    const formattedMessageMap = Object.keys(messageDescriptorMap).reduce(
        (acc, key) => {
            const k = key as T;
            acc[k] = <FormattedMessage {...messageDescriptorMap[k]} />;
            return acc;
        },
        {} as Record<T, ReactNode>,
    );

    const Component: FunctionComponent<{ value: T }> = ({ value }) => {
        return formattedMessageMap[value];
    };

    return {
        Component,
        messageDescriptorMap,
        formattedMessageMap,
    };
}
```
