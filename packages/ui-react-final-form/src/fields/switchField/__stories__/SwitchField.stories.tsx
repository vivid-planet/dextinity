import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";

import { finalFormDecorator } from "../../../storybook/FinalFormStoryFrame";
import { SwitchField } from "../SwitchField";

const meta = {
    title: "Fields/SwitchField",
    component: SwitchField,
    decorators: [finalFormDecorator],
    parameters: { initialValues: { published: true } },
    args: { name: "published", children: "Published", description: "Visible on the website" },
} satisfies Meta<typeof SwitchField>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const switchControl = canvas.getByRole("switch", { name: /Published/ });
        await expect(switchControl).toBeChecked();

        await userEvent.click(switchControl);
        await expect(canvas.getByText('Values: {"published":false}')).toBeInTheDocument();
    },
};
