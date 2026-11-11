import type { Meta, StoryObj } from "@storybook/react-vite";

import { themeDecorator } from "../../../storybook/themeDecorator";
import { FormHelperText } from "../FormHelperText";

const meta = {
    component: FormHelperText,
    title: "Building blocks/Form fields/FormHelperText",
    decorators: [themeDecorator],
    args: {
        children: "Additional info text",
    },
    argTypes: {
        className: { control: false },
        slots: { control: false },
        slotProps: { control: false },
        ref: { control: false },
    },
} satisfies Meta<typeof FormHelperText>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Error: Story = {
    args: {
        error: true,
        children: "Enter a title",
    },
};
