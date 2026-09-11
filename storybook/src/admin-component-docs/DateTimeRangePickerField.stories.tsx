import { DateTimeRangePickerField, FinalForm } from "@dextinity/admin";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { componentDocsDecorator } from "./utils/componentDocsDecorator";
import { DocsPage } from "./utils/DocsPage";

type Story = StoryObj<typeof DateTimeRangePickerField>;

const meta: Meta<typeof DateTimeRangePickerField> = {
    component: DateTimeRangePickerField,
    title: "Component Docs/DateTimeRangePickerField",
    tags: ["adminComponentDocs"],
    decorators: [componentDocsDecorator()],
    parameters: {
        docs: {
            page: () => <DocsPage defaultStory={Default} />,
        },
    },
    argTypes: {
        fullWidth: {
            control: "boolean",
        },
        required: {
            control: "boolean",
        },
        disabled: {
            control: "boolean",
        },
        readOnly: {
            control: "boolean",
        },
        name: {
            control: "text",
        },
        label: {
            control: "text",
        },
        helperText: {
            control: "text",
        },
    },
    args: {
        name: "dateTimeRange",
        label: "Date Time Range",
    },
};

export default meta;

/**
 * The `DateTimeRangePickerField` component is used to select a date-time range in a Final Form.
 *
 * For usage outside of Final Form, use the `DateTimeRangePicker` component.
 */
export const Default: Story = {
    render: ({ ...props }) => {
        return (
            <FinalForm mode="edit" onSubmit={() => {}}>
                <DateTimeRangePickerField {...props} />
            </FinalForm>
        );
    },
};
