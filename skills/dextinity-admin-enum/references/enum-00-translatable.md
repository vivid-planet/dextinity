# Translatable Enum Component

**Always read this file first** — it is the base pattern for every enum component.

## File Location

```
{domain}/components/{camelCaseName}/{EnumName}
```

Examples:

- `LocationStatus` → `location/components/locationStatus/LocationStatus`
- `ProductCategory` → `product/components/productCategory/ProductCategory`

If the domain is unclear, ask the user.

## Template

```ts
import { createTranslatableEnum } from "@src/common/components/enums/createTranslatableEnum";
import { type GQL{EnumName} } from "@src/graphql.generated";
import { defineMessage } from "react-intl";

const {
    messageDescriptorMap,
    formattedMessageMap,
    Component: {EnumName},
} = createTranslatableEnum<GQL{EnumName}>({
    {ENUM_VALUE}: defineMessage({ defaultMessage: "{GermanLabel}", id: "{domain}.{camelCaseName}.{camelCaseValue}" }),
    // ... one entry per enum value
});

export { {EnumName}, formattedMessageMap as {camelCaseName}FormattedMessageMap, messageDescriptorMap as {camelCaseName}MessageDescriptorMap };
```

## Concrete Example

For `enum LocationStatus { ACTIVE INACTIVE }`:

```ts
import { createTranslatableEnum } from "@src/common/components/enums/createTranslatableEnum";
import { type GQLLocationStatus } from "@src/graphql.generated";
import { defineMessage } from "react-intl";

const {
    messageDescriptorMap,
    formattedMessageMap,
    Component: LocationStatus,
} = createTranslatableEnum<GQLLocationStatus>({
    ACTIVE: defineMessage({ defaultMessage: "Aktiv", id: "location.locationStatus.active" }),
    INACTIVE: defineMessage({ defaultMessage: "Inaktiv", id: "location.locationStatus.inactive" }),
});

export { LocationStatus, formattedMessageMap as locationStatusFormattedMessageMap, messageDescriptorMap as locationStatusMessageDescriptorMap };
```

## Translations

- Derive sensible labels from the enum value name (e.g. `ACTIVE` → `"Active"`, `INACTIVE` → `"Inactive"`)
- If the user provides translations in the prompt, use those instead
- The `id` should have semantic meaning derived from the file path. Use the component's domain path to build the id (e.g. for a file at `location/components/locationStatus/LocationStatus` → `location.locationStatus.active`)

## Storybook Story

Place in `__stories__/` subfolder next to the component file. One story per enum value.

**Story title convention:** `{Domain}/Components/Enums/{camelCaseName}/{ComponentName}`

```tsx
// File: admin/src/location/components/locationStatus/__stories__/LocationStatus.stories.tsx

import type { Meta, StoryObj } from "@storybook/react-vite";

import { LocationStatus } from "../LocationStatus";

type Story = StoryObj<typeof LocationStatus>;
const meta: Meta<typeof LocationStatus> = {
    component: LocationStatus,
    title: "Common/Components/Enums/locationStatus/LocationStatus",
};
export default meta;

export const Active: Story = {
    args: {
        value: "ACTIVE",
    },
};

export const Inactive: Story = {
    args: {
        value: "INACTIVE",
    },
};
```
