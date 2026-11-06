import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";

import { reactHookFormDecorator } from "../../storybook/ReactHookFormStoryFrame";
import { SwitchField } from "../SwitchField";

const meta = {
    title: "Forms/React Hook Form/SwitchField",
    component: SwitchField,
    decorators: [reactHookFormDecorator],
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
