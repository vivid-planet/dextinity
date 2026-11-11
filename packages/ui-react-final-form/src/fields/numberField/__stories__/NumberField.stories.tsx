import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";

import { finalFormDecorator } from "../../../storybook/FinalFormStoryFrame";
import { NumberField } from "../NumberField";

const meta = {
    title: "Fields/NumberField",
    component: NumberField,
    decorators: [finalFormDecorator],
    parameters: { initialValues: { price: 49.9 } },
    args: { name: "price", label: "Price", decimals: 2, min: 0, suffix: "€", locale: "en-US" },
} satisfies Meta<typeof NumberField>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);

        await userEvent.click(canvas.getByRole("button", { name: "Increase" }));
        await expect(canvas.getByText('Values: {"price":50.9}')).toBeInTheDocument();
    },
};

export const Validation: Story = {
    args: { validate: (value) => (typeof value === "number" && value > 100 ? "Keep the price at 100 € or below" : undefined) },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const input = canvas.getByRole("textbox", { name: "Price" });

        await userEvent.clear(input);
        await userEvent.type(input, "120");
        await userEvent.tab();
        await expect(canvas.getByText("Keep the price at 100 € or below")).toBeVisible();
        await expect(input).toBeInvalid();
    },
};

export const Required: Story = {
    args: { name: "quantity", label: "Quantity", decimals: undefined, suffix: undefined, required: true, requiredMessage: "Enter a quantity" },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);

        await userEvent.click(canvas.getByRole("button", { name: "Submit" }));
        await expect(canvas.getByText("Enter a quantity")).toBeVisible();
        await expect(canvas.getByRole("textbox", { name: "Quantity" })).toHaveFocus();
    },
};
