import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";

import { reactHookFormDecorator } from "../../storybook/ReactHookFormStoryFrame";
import { CheckboxGroupField } from "../CheckboxGroupField";

const meta = {
    title: "Forms/React Hook Form/CheckboxGroupField",
    component: CheckboxGroupField,
    decorators: [reactHookFormDecorator],
    parameters: { initialValues: { scopes: ["main-de"] } },
    args: {
        name: "scopes",
        label: "Content scopes",
        options: [
            {
                value: "main",
                label: "Main",
                children: [
                    { value: "main-de", label: "German" },
                    { value: "main-en", label: "English" },
                ],
            },
            { value: "secondary", label: "Secondary", children: [{ value: "secondary-de", label: "German" }] },
        ],
    },
} satisfies Meta<typeof CheckboxGroupField>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);

        await userEvent.click(canvas.getByRole("checkbox", { name: "Main" }));
        await expect(canvas.getByText('Values: {"scopes":["main-de","main-en"]}')).toBeInTheDocument();
    },
};

export const Required: Story = {
    args: { name: "channels", required: true, requiredMessage: "Select at least one scope" },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);

        await userEvent.click(canvas.getByRole("button", { name: "Submit" }));
        await expect(canvas.getByText("Select at least one scope")).toBeVisible();
        await expect(canvas.getByRole("checkbox", { name: "Main" })).toHaveFocus();
    },
};
