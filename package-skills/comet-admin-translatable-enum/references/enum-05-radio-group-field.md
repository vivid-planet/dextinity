# RadioGroupField

All options visible at once. Best for few options (<=4).

## Prerequisites

1. **Translatable enum** must exist — create using [enum-00-translatable.md](enum-00-translatable.md) if missing
2. **`recordToOptions` helper** must exist — search for it in the project. Create from [enum-helper-record-to-options.md](enum-helper-record-to-options.md) if missing

## File Location

```
{domain}/components/{camelCaseName}RadioGroupField/{EnumName}RadioGroupField
```

## Template

```tsx
import { RadioGroupField, type RadioGroupFieldProps } from "@comet/admin";
import { {camelCaseName}FormattedMessageMap } from "{enumImportPath}";
import { recordToOptions } from "@src/common/components/enums/recordToOptions";
import { type GQL{EnumName} } from "@src/graphql.generated";
import { type FunctionComponent } from "react";

export type {EnumName}FormState = GQL{EnumName};

type {EnumName}RadioGroupFieldProps = Omit<RadioGroupFieldProps<{EnumName}FormState>, "options">;

export const {EnumName}RadioGroupField: FunctionComponent<{EnumName}RadioGroupFieldProps> = ({ name, ...restProps }) => {
    return <RadioGroupField name={name} {...restProps} options={recordToOptions({camelCaseName}FormattedMessageMap)} />;
};
```

## Concrete Example

```tsx
// File: admin/src/location/components/locationStatusRadioGroupField/LocationStatusRadioGroupField.tsx

import { RadioGroupField, type RadioGroupFieldProps } from "@comet/admin";
import { locationStatusFormattedMessageMap } from "@src/common/components/enums/locationStatus/locationStatus/LocationStatus";
import { recordToOptions } from "@src/common/components/enums/recordToOptions";
import { type GQLLocationStatus } from "@src/graphql.generated";
import { type FunctionComponent } from "react";

export type LocationStatusFormState = GQLLocationStatus;

type LocationStatusRadioGroupFieldProps = Omit<RadioGroupFieldProps<LocationStatusFormState>, "options">;

export const LocationStatusRadioGroupField: FunctionComponent<LocationStatusRadioGroupFieldProps> = ({ name, ...restProps }) => {
    return <RadioGroupField name={name} {...restProps} options={recordToOptions(locationStatusFormattedMessageMap)} />;
};
```

## Storybook Story

Single `Default` story wrapping in `<FinalForm>` with `<FinalFormDebug />`.

```tsx
// File: admin/src/location/components/locationStatusRadioGroupField/__stories__/LocationStatusRadioGroupField.stories.tsx

import type { Meta, StoryObj } from "@storybook/react-vite";

import { FinalForm, FinalFormDebug } from "@comet/admin";
import { FormattedMessage } from "react-intl";
import { LocationStatusFormState, LocationStatusRadioGroupField } from "../LocationStatusRadioGroupField";

type Story = StoryObj<typeof LocationStatusRadioGroupField>;
const config: Meta<typeof LocationStatusRadioGroupField> = {
    component: LocationStatusRadioGroupField,
    title: "common/components/enums/locationStatus/LocationStatusRadioGroupField",
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
                            <LocationStatusRadioGroupField
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
```
