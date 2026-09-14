import { DateTimeRangePicker } from "@dextinity/admin";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { componentDocsDecorator } from "./utils/componentDocsDecorator";
import { DocsPage } from "./utils/DocsPage";

type Story = StoryObj<typeof DateTimeRangePicker>;

const meta: Meta<typeof DateTimeRangePicker> = {
    component: DateTimeRangePicker,
    title: "Component Docs/DateTimeRangePicker",
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
    },
};

export default meta;

/**
 * The `DateTimeRangePicker` component is used to select a date-time range in a form.
 *
 * For usage inside Final Form, use the `DateTimeRangePickerField` component.
 */
export const Default: Story = {};
