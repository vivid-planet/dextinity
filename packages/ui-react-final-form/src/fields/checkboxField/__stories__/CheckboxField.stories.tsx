import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";

import { finalFormDecorator } from "../../../storybook/FinalFormStoryFrame";
import { CheckboxField } from "../CheckboxField";

const meta = {
    title: "Forms/Final Form/CheckboxField",
    component: CheckboxField,
    decorators: [finalFormDecorator],
    args: { name: "newsletter", children: "Subscribe to the newsletter" },
} satisfies Meta<typeof CheckboxField>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);

        await userEvent.click(canvas.getByRole("checkbox", { name: "Subscribe to the newsletter" }));
        await expect(canvas.getByText('Values: {"newsletter":true}')).toBeInTheDocument();
    },
};

export const Required: Story = {
    args: { name: "terms", children: "I accept the terms of use", required: true, requiredMessage: "Accept the terms to continue" },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const checkbox = canvas.getByRole("checkbox", { name: "I accept the terms of use" });

        await userEvent.click(canvas.getByRole("button", { name: "Submit" }));
        await expect(canvas.getByText("Accept the terms to continue")).toBeVisible();
        await expect(checkbox).toHaveFocus();

        await userEvent.click(checkbox);
        await expect(canvas.queryByText("Accept the terms to continue")).not.toBeInTheDocument();
    },
};

/**
 * Checkboxes with a `value` share one field, which holds the list of the checked boxes' values.
 */
export const Group: Story = {
    parameters: { initialValues: { channels: ["email"] } },
    render: () => (
        <div role="group" aria-label="Channels">
            <CheckboxField name="channels" value="email">
                Email
            </CheckboxField>
            <CheckboxField name="channels" value="sms">
                SMS
            </CheckboxField>
            <CheckboxField name="channels" value="push">
                Push notification
            </CheckboxField>
        </div>
    ),
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);

        await userEvent.click(canvas.getByRole("checkbox", { name: "Push notification" }));
        await userEvent.click(canvas.getByRole("checkbox", { name: "Email" }));
        await expect(canvas.getByText('Values: {"channels":["push"]}')).toBeInTheDocument();
    },
};
