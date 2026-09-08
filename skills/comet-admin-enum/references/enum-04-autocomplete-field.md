# AutocompleteField

Enum selection with search/filter support. Returns `{ value, label: string }`.

## Prerequisites

1. **Translatable enum** must exist — create using [enum-00-translatable.md](enum-00-translatable.md) if missing
2. **`useAutocompleteOptions` hook** must exist — create using [enum-helper-use-autocomplete-options.md](enum-helper-use-autocomplete-options.md) if missing

## File Location

```
{domain}/components/{camelCaseName}AutocompleteField/{EnumName}AutocompleteField
```

## Template

```tsx
import { AutocompleteField, type AutocompleteFieldProps } from "@comet/admin";
import { {camelCaseName}MessageDescriptorMap } from "{enumImportPath}";
import { useAutocompleteOptions } from "@src/common/components/enums/useAutocompleteOptions";
import { type GQL{EnumName} } from "@src/graphql.generated";
import { type FunctionComponent } from "react";

export type {EnumName}FormState = GQL{EnumName};

type {EnumName}AutocompleteFieldOption = { value: GQL{EnumName}; label: string };

type {EnumName}AutocompleteFieldProps = Omit<
    AutocompleteFieldProps<{EnumName}AutocompleteFieldOption, false, false, false>,
    "options" | "getOptionLabel"
>;

export const {EnumName}AutocompleteField: FunctionComponent<{EnumName}AutocompleteFieldProps> = ({ name, ...restProps }) => {
    const options = useAutocompleteOptions({camelCaseName}MessageDescriptorMap);
    return <AutocompleteField name={name} {...restProps} options={options} getOptionLabel={(option) => option.label} />;
};
```

## Concrete Example

```tsx
// File: admin/src/location/components/locationStatusAutocompleteField/LocationStatusAutocompleteField.tsx

import { AutocompleteField, type AutocompleteFieldProps } from "@comet/admin";
import { locationStatusMessageDescriptorMap } from "@src/common/components/enums/locationStatus/locationStatus/LocationStatus";
import { useAutocompleteOptions } from "@src/common/components/enums/useAutocompleteOptions";
import { type GQLLocationStatus } from "@src/graphql.generated";
import { type FunctionComponent } from "react";

export type LocationStatusFormState = GQLLocationStatus;

type LocationStatusAutocompleteFieldOption = {
    value: GQLLocationStatus;
    label: string;
};

type LocationStatusAutocompleteFieldProps = Omit<
    AutocompleteFieldProps<LocationStatusAutocompleteFieldOption, false, false, false>,
    "options" | "getOptionLabel"
>;

export const LocationStatusAutocompleteField: FunctionComponent<LocationStatusAutocompleteFieldProps> = ({ name, ...restProps }) => {
    const options = useAutocompleteOptions(locationStatusMessageDescriptorMap);

    return (
        <AutocompleteField
            name={name}
            {...restProps}
            options={options}
            getOptionLabel={(option) => {
                return option.label;
            }}
        />
    );
};
```

## Storybook Story

`Default` story (single value) + `Multiple` story (array value, `multiple` prop).

```tsx
// File: admin/src/location/components/locationStatusAutocompleteField/__stories__/LocationStatusAutocompleteField.stories.tsx

import { Meta, StoryObj } from "@storybook/react-vite";
import { FinalForm, FinalFormDebug } from "@comet/admin";
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
                                label={<FormattedMessage id={"comet.location.status"} defaultMessage="Location Status" />}
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
                                label={<FormattedMessage id={"comet.location.statuses"} defaultMessage="Location Statuses" />}
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
