import type { Meta, StoryObj } from "@storybook/react-vite";

import { Alert } from "../../alert/Alert";
import { FieldSet } from "../../common/FieldSet";
import { FinalForm } from "../../FinalForm";
import { RadioGroupField, type RadioGroupFieldProps } from "../../form/fields/RadioGroupField";

type Story = StoryObj<typeof RadioGroupField>;
const config: Meta<typeof RadioGroupField> = {
    component: RadioGroupField,
    title: "components/form/RadioGroupField",
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
                            <RadioGroupField
                                options={[
                                    {
                                        label: "Option 1",
                                        value: "option1",
                                    },
                                    {
                                        label: "Option 2",
                                        value: "option2",
                                    },
                                    {
                                        label: "Option 3",
                                        value: "option3",
                                    },
                                ]}
                                name="value"
                                label="Radio Group Field"
                                fullWidth
                                variant="horizontal"
                            />

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

const optionsWithShortNames: RadioGroupFieldProps<string>["options"] = [
    {
        label: "Option 1",
        value: "option1",
    },
    {
        label: "[disabled] Option 2",
        value: "option2",
        disabled: true,
    },
    {
        label: "Option 3",
        value: "option3",
    },
    {
        label: "Option 4",
        value: "option4",
    },
    {
        label: "Option 5",
        value: "option5",
    },
    {
        label: "Option 6",
        value: "option6",
    },
    {
        label: "Option 7",
        value: "option7",
    },
];

const optionsWithLongNames: RadioGroupFieldProps<string>["options"] = [
    {
        label: "Donec sed odio dui.",
        value: "donec",
    },
    {
        label: "[disabled] Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus.",
        value: "lorem",
        disabled: true,
    },
    {
        label: "Duis mollis, est non commodo luctus, nisi erat porttitor ligula, eget lacinia odio sem nec elit.",
        value: "duis",
    },
    {
        label: "Aenean eu leo quam. Pellentesque ornare sem lacinia quam venenatis vestibulum.",
        value: "aenean",
    },
    {
        label: "Donec id elit non mi porta gravida at eget metus.",
        value: "donec-id",
    },
    {
        label: "Etiam porta sem malesuada magna mollis euismod.",
        value: "etiam",
    },
    {
        label: "Curabitur blandit tempus porttitor. Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Maecenas faucibus mollis interdum.",
        value: "curabitur",
    },
];

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
                    <>
                        <FieldSet title="Horizontal Field-Variant">
                            <RadioGroupField
                                name="horizontalRowShortOptions"
                                label="Row Layout"
                                variant="horizontal"
                                layout="row"
                                options={optionsWithShortNames}
                                fullWidth
                            />
                            <RadioGroupField
                                name="horizontalColumnShortOptions"
                                label="Column Layout"
                                variant="horizontal"
                                layout="column"
                                options={optionsWithShortNames}
                                fullWidth
                            />
                            <RadioGroupField
                                name="horizontalRowLongOptions"
                                label="Row Layout"
                                variant="horizontal"
                                layout="row"
                                options={optionsWithLongNames}
                                fullWidth
                            />
                            <RadioGroupField
                                name="horizontalColumnLongOptions"
                                label="Column Layout"
                                variant="horizontal"
                                layout="column"
                                options={optionsWithLongNames}
                                fullWidth
                            />
                        </FieldSet>
                        <FieldSet title="Vertical Field-Variant">
                            <RadioGroupField
                                name="verticalRowShortOptions"
                                label="Row Layout"
                                variant="vertical"
                                layout="row"
                                options={optionsWithShortNames}
                                fullWidth
                            />
                            <RadioGroupField
                                name="verticalColumnShortOptions"
                                label="Column Layout"
                                variant="vertical"
                                layout="column"
                                options={optionsWithShortNames}
                                fullWidth
                            />
                            <RadioGroupField
                                name="verticalRowLongOptions"
                                label="Row Layout"
                                variant="vertical"
                                layout="row"
                                options={optionsWithLongNames}
                                fullWidth
                            />
                            <RadioGroupField
                                name="verticalColumnLongOptions"
                                label="Column Layout"
                                variant="vertical"
                                layout="column"
                                options={optionsWithLongNames}
                                fullWidth
                            />
                        </FieldSet>
                    </>
                )}
            </FinalForm>
        );
    },
};
