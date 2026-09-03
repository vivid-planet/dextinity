# SelectField

Default single-value enum selection field for Final Form.

## Prerequisites

1. **Translatable enum** must exist — create using [enum-00-translatable.md](enum-00-translatable.md) if missing
2. **`recordToOptions` helper** must exist — search for it in the project. Create from [enum-helper-record-to-options.md](enum-helper-record-to-options.md) if missing

## File Location

```
{domain}/components/{camelCaseName}SelectField/{EnumName}SelectField
```

## Template

```tsx
import { SelectField, type SelectFieldProps } from "@comet/admin";
import { {camelCaseName}FormattedMessageMap } from "{enumImportPath}";
import { recordToOptions } from "@src/common/components/enums/recordToOptions";
import { type GQL{EnumName} } from "@src/graphql.generated";
import { type FunctionComponent } from "react";

export type {EnumName}FormState = GQL{EnumName};

type {EnumName}SelectFieldProps = Omit<SelectFieldProps<{EnumName}FormState>, "options">;

export const {EnumName}SelectField: FunctionComponent<{EnumName}SelectFieldProps> = ({ name, ...restProps }) => {
    return <SelectField name={name} {...restProps} options={recordToOptions({camelCaseName}FormattedMessageMap)} />;
};
```

## Concrete Example

```tsx
// File: admin/src/location/components/locationStatusSelectField/LocationStatusSelectField.tsx

import { SelectField, type SelectFieldProps } from "@comet/admin";
import { locationStatusFormattedMessageMap } from "@src/common/components/enums/locationStatus/locationStatus/LocationStatus";
import { recordToOptions } from "@src/common/components/enums/recordToOptions";
import { type GQLLocationStatus } from "@src/graphql.generated";
import { type FunctionComponent } from "react";

export type LocationStatusFormState = GQLLocationStatus;

type LocationStatusSelectFieldProps = Omit<SelectFieldProps<LocationStatusFormState>, "options">;

export const LocationStatusSelectField: FunctionComponent<LocationStatusSelectFieldProps> = ({ name, ...restProps }) => {
    return <SelectField name={name} {...restProps} options={recordToOptions(locationStatusFormattedMessageMap)} />;
};
```

## Storybook Story

Single `Default` story wrapping in `<FinalForm>` with `<FinalFormDebug />`.

```tsx
// File: admin/src/location/components/locationStatusSelectField/__stories__/LocationStatusSelectField.stories.tsx

import type { Meta, StoryObj } from "@storybook/react-vite";

import { FinalForm, FinalFormDebug } from "@comet/admin";
import { FormattedMessage } from "react-intl";
import { LocationStatusFormState, LocationStatusSelectField } from "../LocationStatusSelectField";

type Story = StoryObj<typeof LocationStatusSelectField>;
const config: Meta<typeof LocationStatusSelectField> = {
    component: LocationStatusSelectField,
    title: "common/components/enums/locationStatus/LocationStatusSelectField",
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
                            <LocationStatusSelectField
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
