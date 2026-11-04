import { Stack } from "@mui/material";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { Alert } from "../../alert/Alert";
import { FieldSet } from "../../common/FieldSet";
import { FinalForm } from "../../FinalForm";
import { SwitchField } from "../../form/fields/SwitchField";

type Story = StoryObj<typeof SwitchField>;
const config: Meta<typeof SwitchField> = {
    component: SwitchField,
    title: "components/form/SwitchField",
};
export default config;

export const Default: Story = {
    render: () => {
        interface FormValues {
            value: string;
        }
        return (
            <FinalForm<FormValues>
                mode="edit"
                onSubmit={() => {
                    // not handled
                }}
                subscription={{ values: true }}
            >
                {({ values }) => {
                    return (
                        <>
                            <SwitchField name="value" label="Switch Field" fullWidth variant="horizontal" />

                            <Alert title="FormState">
                                <pre>{JSON.stringify(values, null, 2)}</pre>
                            </Alert>
                        </>
                    );
                }}
            </FinalForm>
        );
    },
};

export const LayoutVariants: Story = {
    render: () => {
        return (
            <FinalForm
                mode="edit"
                onSubmit={() => {
                    // not handled
                }}
            >
                {() => (
                    <Stack spacing={5} p={5}>
                        <FieldSet title="Single line SwitchField">
                            <SwitchField
                                name="singleLineHorizontal"
                                fieldLabel="Single Line Horizontal"
                                label="Hello Switch"
                                variant="horizontal"
                                fullWidth
                            />
                            <SwitchField
                                name="singleLineVertical"
                                fieldLabel="Single Line Vertical"
                                label="Hello Switch"
                                variant="vertical"
                                fullWidth
                            />
                        </FieldSet>
                        <FieldSet title="Multi line SwitchField">
                            <SwitchField
                                name="multiLineHorizontal"
                                fieldLabel="Multi Line Horizontal"
                                label="Nulla vitae elit libero, a pharetra augue. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas sed diam eget risus varius blandit sit amet non magna. Nullam quis risus eget urna mollis ornare vel eu leo."
                                variant="horizontal"
                                fullWidth
                            />
                            <SwitchField
                                name="multiLineVertical"
                                fieldLabel="Multi Line Vertical"
                                label="Nulla vitae elit libero, a pharetra augue. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas sed diam eget risus varius blandit sit amet non magna. Nullam quis risus eget urna mollis ornare vel eu leo."
                                variant="vertical"
                                fullWidth
                            />
                        </FieldSet>
                    </Stack>
                )}
            </FinalForm>
        );
    },
};
