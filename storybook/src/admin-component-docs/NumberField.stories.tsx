import { FinalForm, NumberField } from "@dextinity/admin";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { commonFieldComponentArgTypes } from "./utils/commonArgTypes";
import { componentDocsDecorator } from "./utils/componentDocsDecorator";
import { DocsPage } from "./utils/DocsPage";

type Story = StoryObj<typeof NumberField>;

const meta: Meta<typeof NumberField> = {
    component: NumberField,
    title: "Component Docs/NumberField",
    tags: ["adminComponentDocs"],
    decorators: [componentDocsDecorator()],
    parameters: {
        docs: {
            page: () => <DocsPage defaultStory={Default} />,
        },
    },
    argTypes: {
        decimals: {
            control: "number",
        },
        ...commonFieldComponentArgTypes,
    },
    args: {
        name: "number",
        label: "Number",
    },
};

export default meta;

/**
 * Used to add a number input to a Final Form, its value is stored as a number.
 */
export const Default: Story = {
    render: (props) => {
        return (
            <FinalForm mode="edit" onSubmit={() => {}}>
                <NumberField {...props} />
            </FinalForm>
        );
    },
};
