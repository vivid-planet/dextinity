import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";

import { finalFormDecorator } from "../../../storybook/FinalFormStoryFrame";
import { RadioGroupField } from "../RadioGroupField";

const meta = {
    title: "Forms/Final Form/RadioGroupField",
    component: RadioGroupField,
    decorators: [finalFormDecorator],
    parameters: { initialValues: { employment: "full-time" } },
    args: {
        name: "employment",
        label: "Employment",
        options: [
            { value: "full-time", label: "Full-time" },
            { value: "part-time", label: "Part-time" },
            { value: "freelance", label: "Freelance" },
        ],
    },
} satisfies Meta<typeof RadioGroupField>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);

        await userEvent.click(canvas.getByRole("radio", { name: "Freelance" }));
        await expect(canvas.getByText('Values: {"employment":"freelance"}')).toBeInTheDocument();
    },
};

export const Required: Story = {
    args: { name: "type", required: true, requiredMessage: "Choose the type of employment", variant: "card" },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);

        await userEvent.click(canvas.getByRole("button", { name: "Submit" }));
        await expect(canvas.getByText("Choose the type of employment")).toBeVisible();
        await expect(canvas.getByRole("radio", { name: "Full-time" })).toHaveFocus();
    },
};
