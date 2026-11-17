# AutocompleteField

Enum selection with search/filter support. The form value is the enum value (an array of enum values with `multiple`), like in the other enum fields.

`AutocompleteField` itself stores the selected option object, so the component converts between enum value and option with `format` and `parse`. Without them, the mutation receives `{ value, label }` instead of the enum value.

## Prerequisites

1. **Translatable enum** must exist — create using [enum-00-translatable.md](enum-00-translatable.md) if missing
2. **`useAutocompleteOptions` hook** must exist — create using [enum-helper-use-autocomplete-options.md](enum-helper-use-autocomplete-options.md) if missing

## File Location

```
{domain}/components/{camelCaseName}AutocompleteField/{EnumName}AutocompleteField
```

## Template

```tsx
import { AutocompleteField, type AutocompleteFieldProps } from "@dextinity/admin";
import { {camelCaseName}MessageDescriptorMap } from "{enumImportPath}";
import { useAutocompleteOptions } from "@src/common/components/enums/useAutocompleteOptions";
import { type GQL{EnumName} } from "@src/graphql.generated";

export type {EnumName}FormState = GQL{EnumName};

type {EnumName}AutocompleteFieldOption = { value: GQL{EnumName}; label: string };

type {EnumName}AutocompleteFieldProps = Omit<
    AutocompleteFieldProps<{EnumName}AutocompleteFieldOption, boolean, false, false>,
    "options" | "getOptionLabel" | "isOptionEqualToValue" | "format" | "parse"
>;

export function {EnumName}AutocompleteField({ name, ...restProps }: {EnumName}AutocompleteFieldProps) {
    const options = useAutocompleteOptions({camelCaseName}MessageDescriptorMap);
    const findOption = (value: GQL{EnumName}) => options.find((option) => option.value === value);

    return (
        <AutocompleteField
            name={name}
            {...restProps}
            options={options}
            getOptionLabel={(option) => option.label}
            isOptionEqualToValue={(option, value) => option.value === value.value}
            format={(value: GQL{EnumName} | GQL{EnumName}[] | null | undefined) => {
                if (Array.isArray(value)) {
                    return value.flatMap((item) => findOption(item) ?? []);
                }
                return (value && findOption(value)) ?? null;
            }}
            parse={(option: {EnumName}AutocompleteFieldOption | {EnumName}AutocompleteFieldOption[] | null) => {
                if (Array.isArray(option)) {
                    return option.map(({ value }) => value);
                }
                return option?.value ?? null;
            }}
        />
    );
}
```

## Concrete Example

```tsx
// File: admin/src/location/components/locationStatusAutocompleteField/LocationStatusAutocompleteField.tsx

import { AutocompleteField, type AutocompleteFieldProps } from "@dextinity/admin";
import { locationStatusMessageDescriptorMap } from "@src/common/components/enums/locationStatus/locationStatus/LocationStatus";
import { useAutocompleteOptions } from "@src/common/components/enums/useAutocompleteOptions";
import { type GQLLocationStatus } from "@src/graphql.generated";

export type LocationStatusFormState = GQLLocationStatus;

type LocationStatusAutocompleteFieldOption = {
    value: GQLLocationStatus;
    label: string;
};

type LocationStatusAutocompleteFieldProps = Omit<
    AutocompleteFieldProps<LocationStatusAutocompleteFieldOption, boolean, false, false>,
    "options" | "getOptionLabel" | "isOptionEqualToValue" | "format" | "parse"
>;

export function LocationStatusAutocompleteField({ name, ...restProps }: LocationStatusAutocompleteFieldProps) {
    const options = useAutocompleteOptions(locationStatusMessageDescriptorMap);
    const findOption = (value: GQLLocationStatus) => options.find((option) => option.value === value);

    return (
        <AutocompleteField
            name={name}
            {...restProps}
            options={options}
            getOptionLabel={(option) => option.label}
            isOptionEqualToValue={(option, value) => option.value === value.value}
            format={(value: GQLLocationStatus | GQLLocationStatus[] | null | undefined) => {
                if (Array.isArray(value)) {
                    return value.flatMap((item) => findOption(item) ?? []);
                }
                return (value && findOption(value)) ?? null;
            }}
            parse={(option: LocationStatusAutocompleteFieldOption | LocationStatusAutocompleteFieldOption[] | null) => {
                if (Array.isArray(option)) {
                    return option.map(({ value }) => value);
                }
                return option?.value ?? null;
            }}
        />
    );
}
```

## Storybook Story

`Default` story (single value) + `Multiple` story (array value, `multiple` prop).

```tsx
// File: admin/src/location/components/locationStatusAutocompleteField/__stories__/LocationStatusAutocompleteField.stories.tsx

import { Meta, StoryObj } from "@storybook/react-vite";
import { FinalForm, FinalFormDebug } from "@dextinity/admin";
import { FormattedMessage } from "react-intl";
import { LocationStatusAutocompleteField, LocationStatusFormState } from "../LocationStatusAutocompleteField";

type Story = StoryObj<typeof LocationStatusAutocompleteField>;
const config: Meta<typeof LocationStatusAutocompleteField> = {
    component: LocationStatusAutocompleteField,
    title: "common/components/enums/locationStatus/LocationStatusAutocompleteField",
};
export default config;

export const Default: Story = {
    render: () => {
        interface FormValues {
            status: LocationStatusFormState;
        }
        return (
            <FinalForm<FormValues>
                initialValues={{}}
                mode="edit"
                onSubmit={() => {
                    // not handled
                }}
                subscription={{ values: true }}
            >
                {({ values }) => {
                    return (
                        <>
                            <LocationStatusAutocompleteField
                                name="status"
                                label={<FormattedMessage id={"location.status"} defaultMessage="Location Status" />}
                                fullWidth
                                variant="horizontal"
                            />

                            <FinalFormDebug />
                        </>
                    );
                }}
            </FinalForm>
        );
    },
};

export const Multiple: Story = {
    render: () => {
        interface FormValues {
            statuses: LocationStatusFormState[];
        }
        return (
            <FinalForm<FormValues>
                initialValues={{}}
                mode="edit"
                onSubmit={() => {
                    // not handled
                }}
                subscription={{ values: true }}
            >
                {({ values }) => {
                    return (
                        <>
                            <LocationStatusAutocompleteField
                                name="statuses"
                                label={<FormattedMessage id={"location.statuses"} defaultMessage="Location Statuses" />}
                                fullWidth
                                variant="horizontal"
                                multiple
                            />

                            <FinalFormDebug />
                        </>
                    );
                }}
            </FinalForm>
        );
    },
};
```
