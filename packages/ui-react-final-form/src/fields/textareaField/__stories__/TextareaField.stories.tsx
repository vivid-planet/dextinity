import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";

import { finalFormDecorator } from "../../../storybook/FinalFormStoryFrame";
import { TextareaField } from "../TextareaField";

const meta = {
    title: "Fields/TextareaField",
    component: TextareaField,
    decorators: [finalFormDecorator],
    parameters: { initialValues: { teaser: "We build digital products that stay in use for many years." } },
    args: { name: "teaser", label: "Teaser" },
} satisfies Meta<typeof TextareaField>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const MaxLength: Story = {
    args: {
        maxLength: 80,
        showCount: true,
        validate: (value) => (typeof value === "string" && value.length < 20 ? "Write at least 20 characters" : undefined),
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const textarea = canvas.getByLabelText("Teaser");

        await userEvent.clear(textarea);
        await userEvent.type(textarea, "Too short");
        await userEvent.tab();
        await expect(canvas.getByText("Write at least 20 characters")).toBeVisible();
        await expect(textarea).toHaveAttribute("aria-invalid", "true");
    },
};
