import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";

import { reactHookFormDecorator } from "../../storybook/ReactHookFormStoryFrame";
import { SliderField } from "../SliderField";

const meta = {
    title: "Forms/React Hook Form/SliderField",
    component: SliderField,
    decorators: [reactHookFormDecorator],
    parameters: { initialValues: { opacity: 40 } },
    args: { name: "opacity", "aria-label": "Opacity" },
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
    args: { rules: { max: { value: 80, message: "Keep the opacity at 80 or below" } } },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);

        canvas.getByRole("slider", { name: "Opacity" }).focus();
        await userEvent.keyboard("{End}");
        await userEvent.tab();
        await expect(canvas.getByText("Keep the opacity at 80 or below")).toBeVisible();
    },
};
