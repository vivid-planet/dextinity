import type { Meta, StoryObj } from "@storybook/react-vite";

import { themeDecorator } from "../../../storybook/themeDecorator";
import { FieldValidationMessage } from "../FieldValidationMessage";

const meta = {
    component: FieldValidationMessage,
    title: "Building blocks/Form fields/FieldValidationMessage",
    decorators: [themeDecorator],
    args: {
        state: "error",
        children: "Enter a title",
    },
    argTypes: {
        children: { control: "text" },
        state: { control: "radio", options: ["error", "warning", "success"] },
        className: { control: false },
        slots: { control: false },
        slotProps: { control: false },
        ref: { control: false },
    },
} satisfies Meta<typeof FieldValidationMessage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Warning: Story = {
    args: {
        state: "warning",
        children: "Search engines may cut titles longer than 60 characters",
    },
};

export const Success: Story = {
    args: {
        state: "success",
        children: "The domain points to this website",
    },
};
