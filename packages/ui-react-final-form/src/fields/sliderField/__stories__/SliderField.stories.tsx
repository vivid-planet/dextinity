import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";

import { finalFormDecorator } from "../../../storybook/FinalFormStoryFrame";
import { SliderField } from "../SliderField";

const meta = {
    title: "Forms/Final Form/SliderField",
    component: SliderField,
    decorators: [finalFormDecorator],
    parameters: { initialValues: { opacity: 40 } },
    args: { name: "opacity", label: "Opacity" },
} satisfies Meta<typeof SliderField>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);

        canvas.getByRole("slider", { name: "Opacity" }).focus();
        await userEvent.keyboard("{ArrowRight}");
        await expect(canvas.getByText('Values: {"opacity":41}')).toBeInTheDocument();
    },
};

export const Validation: Story = {
    args: { validate: (value) => (typeof value === "number" && value > 80 ? "Keep the opacity at 80 or below" : undefined) },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);

        canvas.getByRole("slider", { name: "Opacity" }).focus();
        await userEvent.keyboard("{End}");
        await userEvent.tab();
        await expect(canvas.getByText("Keep the opacity at 80 or below")).toBeVisible();
        await expect(canvas.getByRole("slider", { name: "Opacity" })).toHaveAccessibleDescription("Keep the opacity at 80 or below");
    },
};
