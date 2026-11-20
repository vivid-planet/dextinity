import type { Meta, StoryObj } from "@storybook/react-vite";

import { themeDecorator } from "../../../storybook/themeDecorator";
import { FieldDescription } from "../FieldDescription";
import fieldDescriptionTokens from "../FieldDescription.tokens.scss?raw";

const meta = {
    component: FieldDescription,
    title: "Building blocks/Form fields/FieldDescription",
    decorators: [themeDecorator],
    parameters: { tokens: fieldDescriptionTokens },
    args: {
        children: "Shown in the browser tab and in search results.",
    },
    argTypes: {
        className: { control: false },
        ref: { control: false },
    },
} satisfies Meta<typeof FieldDescription>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
