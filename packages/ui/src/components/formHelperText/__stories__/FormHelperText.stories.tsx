import type { Meta, StoryObj } from "@storybook/react-vite";

import { themeDecorator } from "../../../storybook/themeDecorator";
import { FormHelperText } from "../FormHelperText";
import tokens from "../FormHelperText.tokens.scss?raw";

const meta = {
    component: FormHelperText,
    title: "Building blocks/FormHelperText",
    parameters: {
        tokens,
        rules: {
            dos: [
                "Permanent help below the field.",
                "An error replaces the help text and says what is missing and how to fix it.",
                "Link the text to the field with `aria-describedby`.",
            ],
            donts: ["Technical error codes as the only information.", "An error only in a toast when a field is affected."],
        },
    },
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
