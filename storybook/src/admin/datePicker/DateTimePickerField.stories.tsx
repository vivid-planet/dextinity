import { Alert, DateTimePickerField, FinalForm } from "@dextinity/admin";
import type { Meta, StoryFn } from "@storybook/react-vite";

type Story = StoryFn<typeof DateTimePickerField>;
const config: Meta<typeof DateTimePickerField> = {
    component: DateTimePickerField,
    title: "@dextinity/admin/datePicker/DateTimePickerField",
};
export default config;

const TemplateStory: Story = (props) => {
    const Story = () => {
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
                            <DateTimePickerField label="Date Time Picker" {...props} name="value" />

                            <Alert title="FormState">
                                <pre>{JSON.stringify(values, null, 2)}</pre>
                            </Alert>
                        </>
                    );
                }}
            </FinalForm>
        );
    };

    return <Story />;
};

export const Default = TemplateStory.bind({});
Default.args = {
    fullWidth: true,
    variant: "horizontal",
};

export const MinMaxDate = TemplateStory.bind({});
MinMaxDate.args = {
    fullWidth: true,
    variant: "horizontal",
    minDate: new Date(2025, 0, 1),
    maxDate: new Date(2025, 11, 31),
};

export const Required = TemplateStory.bind({});
Required.args = {
    fullWidth: true,
    variant: "horizontal",
    required: true,
};

export const Disabled = TemplateStory.bind({});
Disabled.args = {
    fullWidth: true,
    variant: "horizontal",
    disabled: true,
};

export const Readonly = TemplateStory.bind({});
Readonly.args = {
    fullWidth: true,
    variant: "horizontal",
    readOnly: true,
};
