import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, screen, userEvent, waitFor, within } from "storybook/test";

import { reactHookFormDecorator } from "../../storybook/ReactHookFormStoryFrame";
import { DateRangeField } from "../DateRangeField";

const meta = {
    title: "Forms/React Hook Form/DateRangeField",
    component: DateRangeField,
    decorators: [reactHookFormDecorator],
    parameters: { initialValues: { period: { start: "2026-11-06", end: "2026-11-12" } } },
    args: { name: "period", label: "Campaign period", locale: "en-GB" },
} satisfies Meta<typeof DateRangeField>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);

        await userEvent.click(canvas.getByRole("button", { name: "Choose dates" }));
        await userEvent.click(await screen.findByRole("button", { name: "Monday, 16 November 2026" }));
        await userEvent.click(screen.getByRole("button", { name: "Friday, 4 December 2026" }));
        await waitFor(() => expect(canvas.getByText('Values: {"period":{"start":"2026-11-16","end":"2026-12-04"}}')).toBeInTheDocument());
    },
};

/**
 * A required range needs both ends.
 */
export const Required: Story = {
    args: { required: true, requiredMessage: "Choose when the campaign starts and ends" },
    parameters: { initialValues: { period: null } },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);

        await userEvent.type(canvas.getByRole("textbox", { name: /Start$/ }), "16/11/2026");
        await userEvent.click(canvas.getByRole("button", { name: "Submit" }));
        await expect(await canvas.findByText("Choose when the campaign starts and ends")).toBeVisible();
        await expect(canvas.queryByRole("status")).not.toBeInTheDocument();
    },
};
