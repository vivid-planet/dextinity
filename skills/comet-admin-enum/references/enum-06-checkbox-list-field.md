# CheckboxListField

Multi-select enum field. Form state is an array.

## Prerequisites

1. **Translatable enum** must exist — create using [enum-00-translatable.md](enum-00-translatable.md) if missing
2. **`recordToOptions` helper** must exist — search for it in the project. Create from [enum-helper-record-to-options.md](enum-helper-record-to-options.md) if missing

## File Location

```
{domain}/components/{camelCaseName}CheckboxListField/{EnumName}CheckboxListField
```

## Template

```tsx
import { CheckboxListField, type CheckboxListFieldProps } from "@comet/admin";
import { {camelCaseName}FormattedMessageMap } from "{enumImportPath}";
import { recordToOptions } from "@src/common/components/enums/recordToOptions";
import { type GQL{EnumName} } from "@src/graphql.generated";
import { type FunctionComponent } from "react";

export type {EnumName}FormState = GQL{EnumName}[];

type {EnumName}CheckboxListFieldProps = Omit<CheckboxListFieldProps<GQL{EnumName}>, "options">;

export const {EnumName}CheckboxListField: FunctionComponent<{EnumName}CheckboxListFieldProps> = ({ name, ...restProps }) => {
    return <CheckboxListField name={name} {...restProps} options={recordToOptions({camelCaseName}FormattedMessageMap)} />;
};
```

## Concrete Example

```tsx
// File: admin/src/location/components/locationStatusCheckboxListField/LocationStatusCheckboxListField.tsx

import { CheckboxListField, type CheckboxListFieldProps } from "@comet/admin";
import { locationStatusFormattedMessageMap } from "@src/common/components/enums/locationStatus/locationStatus/LocationStatus";
import { recordToOptions } from "@src/common/components/enums/recordToOptions";
import { type GQLLocationStatus } from "@src/graphql.generated";
import { type FunctionComponent } from "react";

export type LocationStatusFormState = GQLLocationStatus[];

type LocationStatusCheckboxListFieldProps = Omit<CheckboxListFieldProps<GQLLocationStatus>, "options">;

export const LocationStatusCheckboxListField: FunctionComponent<LocationStatusCheckboxListFieldProps> = ({ name, ...restProps }) => {
    return <CheckboxListField name={name} {...restProps} options={recordToOptions(locationStatusFormattedMessageMap)} />;
};
```

## Storybook Story

Single `Default` story wrapping in `<FinalForm>` with `<FinalFormDebug />`.

```tsx
// File: admin/src/location/components/locationStatusCheckboxListField/__stories__/LocationStatusCheckboxListField.stories.tsx

import type { Meta, StoryObj } from "@storybook/react-vite";

import { FinalForm, FinalFormDebug } from "@comet/admin";
import { FormattedMessage } from "react-intl";
import { LocationStatusCheckboxListField, LocationStatusFormState } from "../LocationStatusCheckboxListField";

type Story = StoryObj<typeof LocationStatusCheckboxListField>;
const config: Meta<typeof LocationStatusCheckboxListField> = {
    component: LocationStatusCheckboxListField,
    title: "common/components/enums/locationStatus/LocationStatusCheckboxListField",
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
                            <LocationStatusCheckboxListField
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
