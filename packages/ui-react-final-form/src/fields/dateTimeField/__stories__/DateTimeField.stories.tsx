import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";

import { finalFormDecorator } from "../../../storybook/FinalFormStoryFrame";
import { DateTimeField } from "../DateTimeField";

const meta = {
    title: "Forms/Final Form/DateTimeField",
    component: DateTimeField,
    decorators: [finalFormDecorator],
    parameters: { initialValues: { publishAt: new Date(2026, 10, 6, 8, 30).toISOString() } },
    args: { name: "publishAt", label: "Publish at", locale: "en-GB" },
} satisfies Meta<typeof DateTimeField>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const time = canvas.getByRole("textbox", { name: "Publish at Time" });

        await userEvent.clear(time);
        await userEvent.type(time, "17:45");
        await userEvent.tab();
        const expected = JSON.stringify({ publishAt: new Date(2026, 10, 6, 17, 45).toISOString() });
        await waitFor(() => expect(canvas.getByText(`Values: ${expected}`)).toBeInTheDocument());
    },
};

export const Required: Story = {
    args: { required: true, requiredMessage: "Choose when the article goes live" },
    parameters: { initialValues: { publishAt: null } },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);

        await userEvent.click(canvas.getByRole("button", { name: "Submit" }));
        await expect(await canvas.findByText("Choose when the article goes live")).toBeVisible();
        await waitFor(() => expect(canvas.getByRole("textbox", { name: /^Publish at$/ })).toHaveFocus());
    },
};
