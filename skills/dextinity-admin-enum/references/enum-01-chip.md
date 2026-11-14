# Chip Component

Renders the enum value as a colored MUI `<Chip>` with an optional dropdown menu to switch values (when `onSelectItem` is provided).

## Prerequisites

1. **Translatable enum** must exist — create it first using [enum-00-translatable.md](enum-00-translatable.md) if missing
2. **`EnumChip` helper** must exist — search for it in the project. Create from [enum-helper-enum-chip.md](enum-helper-enum-chip.md) if missing
3. **`ChipIcon` helper** must exist — search for it in the project. Create from [enum-helper-chip-icon.md](enum-helper-chip-icon.md) if missing

## File Location

```
{domain}/components/{camelCaseName}Chip/{EnumName}Chip
```

Example: `LocationStatus` → `location/components/locationStatusChip/LocationStatusChip`

## Color Conventions

Use MUI `ChipProps["color"]` values: `"success"`, `"error"`, `"warning"`, `"info"`, `"default"`, `"primary"`, `"secondary"`.

| Enum value pattern                 | Color       |
| ---------------------------------- | ----------- |
| `ACTIVE`, `PUBLISHED`, `ENABLED`   | `"success"` |
| `INACTIVE`, `DISABLED`, `ARCHIVED` | `"error"`   |
| `DRAFT`, `PENDING`                 | `"warning"` |
| `SCHEDULED`                        | `"info"`    |

Ask the user if semantics are unclear.

## Template

```tsx
import { Chip } from "@mui/material";
import { EnumChip, type EnumChipProps } from "@src/common/components/enums/enumChip/EnumChip";
import { {EnumName}, {camelCaseName}FormattedMessageMap } from "{enumImportPath}";
import { type GQL{EnumName} } from "@src/graphql.generated";
import { type FunctionComponent } from "react";

import { ChipIcon } from "{chipIconRelativePath}";

type {EnumName}ChipProps = Pick<EnumChipProps<GQL{EnumName}>, "loading" | "onSelectItem" | "value">;

const {camelCaseName}SortOrder: GQL{EnumName}[] = [{ENUM_VALUE_1}, {ENUM_VALUE_2}];

export const {EnumName}Chip: FunctionComponent<{EnumName}ChipProps> = ({ loading, onSelectItem, value }) => {
    return (
        <EnumChip<GQL{EnumName}>
            chipMap={{
                {ENUM_VALUE_1}: (chipProps) => (
                    <Chip
                        clickable={!!chipProps.onClick}
                        color="{color1}"
                        icon={<ChipIcon loading={chipProps.loading} onClick={chipProps.onClick} />}
                        label={<{EnumName} value="{ENUM_VALUE_1}" />}
                        onClick={chipProps.onClick}
                        variant="filled"
                    />
                ),
                // ... one entry per enum value
            }}
            formattedMessageMap={{camelCaseName}FormattedMessageMap}
            loading={loading}
            onSelectItem={onSelectItem}
            sortOrder={{camelCaseName}SortOrder}
            value={value}
        />
    );
};
```

## Concrete Example

```tsx
// File: admin/src/location/components/locationStatusChip/LocationStatusChip.tsx

import { Chip } from "@mui/material";
import { EnumChip, type EnumChipProps } from "@src/common/components/enums/enumChip/EnumChip";
import { LocationStatus, locationStatusFormattedMessageMap } from "@src/common/components/enums/locationStatus/locationStatus/LocationStatus";
import { type GQLLocationStatus } from "@src/graphql.generated";
import { type FunctionComponent } from "react";

import { ChipIcon } from "../../chipIcon/ChipIcon";

type LocationStatusChipProps = Pick<EnumChipProps<GQLLocationStatus>, "loading" | "onSelectItem" | "value">;

const entityStatusOrder: GQLLocationStatus[] = ["ACTIVE", "INACTIVE"];

export const LocationStatusChip: FunctionComponent<LocationStatusChipProps> = ({ loading, onSelectItem, value }) => {
    return (
        <EnumChip<GQLLocationStatus>
            chipMap={{
                ACTIVE: (chipProps) => {
                    return (
                        <Chip
                            clickable={!!chipProps.onClick}
                            color="success"
                            icon={<ChipIcon loading={chipProps.loading} onClick={chipProps.onClick} />}
                            label={<LocationStatus value="ACTIVE" />}
                            onClick={chipProps.onClick}
                            variant="filled"
                        />
                    );
                },
                INACTIVE: (chipProps) => {
                    return (
                        <Chip
                            clickable={!!chipProps.onClick}
                            color="error"
                            icon={<ChipIcon loading={chipProps.loading} onClick={chipProps.onClick} />}
                            label={<LocationStatus value="INACTIVE" />}
                            onClick={chipProps.onClick}
                            variant="filled"
                        />
                    );
                },
            }}
            formattedMessageMap={locationStatusFormattedMessageMap}
            loading={loading}
            onSelectItem={onSelectItem}
            sortOrder={entityStatusOrder}
            value={value}
        />
    );
};
```

## Storybook Story

Per-value stories + `Loading` + one clickable story per value.

```tsx
// File: admin/src/location/components/locationStatusChip/__stories__/LocationStatusChip.stories.tsx

import type { Meta, StoryObj } from "@storybook/react-vite";

import { LocationStatusChip } from "../LocationStatusChip";

type Story = StoryObj<typeof LocationStatusChip>;

const meta: Meta<typeof LocationStatusChip> = {
    component: LocationStatusChip,
    title: "Common/Components/Enums/locationStatus/LocationStatusChip",
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

export const Loading: Story = {
    args: {
        loading: true,
        value: "ACTIVE",
    },
};

export const ActiveClickable: Story = {
    args: {
        onSelectItem: (status) => {
            alert(`Selected Status: ${status}`);
        },
        value: "ACTIVE",
    },
};

export const InactiveClickable: Story = {
    args: {
        onSelectItem: (status) => {
            alert(`Selected Status: ${status}`);
        },
        value: "INACTIVE",
    },
};
```
