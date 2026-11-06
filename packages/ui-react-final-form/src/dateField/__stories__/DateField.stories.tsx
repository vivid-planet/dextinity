import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, screen, userEvent, waitFor, within } from "storybook/test";

import { finalFormDecorator } from "../../storybook/FinalFormStoryFrame";
import { DateField } from "../DateField";

const meta = {
    title: "Forms/Final Form/DateField",
    component: DateField,
    decorators: [finalFormDecorator],
    parameters: { initialValues: { publishedOn: "2026-11-06" } },
    args: { name: "publishedOn", label: "Published on", locale: "en-GB" },
} satisfies Meta<typeof DateField>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);

        await userEvent.click(canvas.getByRole("button", { name: "Choose date" }));
        await userEvent.click(await screen.findByRole("button", { name: "Tuesday, 24 November 2026" }));
        await waitFor(() => expect(canvas.getByText('Values: {"publishedOn":"2026-11-24"}')).toBeInTheDocument());
    },
};

export const Required: Story = {
    args: { required: true, requiredMessage: "Enter the day the article was published", clearable: true },
    parameters: { initialValues: { publishedOn: null } },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const input = canvas.getByRole("textbox", { name: /Published on/ });

        await userEvent.type(input, "not a day");
        await userEvent.tab();
        await expect(await canvas.findByText("Enter the day the article was published")).toBeVisible();
        await expect(input).toHaveValue("");

        await userEvent.click(canvas.getByRole("button", { name: "Submit" }));
        await waitFor(() => expect(input).toHaveFocus());
        await userEvent.type(input, "6/11/2026{Enter}");
        await expect(await canvas.findByRole("status")).toHaveTextContent('Submitted: {"publishedOn":"2026-11-06"}');
    },
};

export const MinAndMax: Story = {
    args: { min: "2026-11-01", max: "2026-11-30", helperText: "A day in November" },
};
