import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";

import { finalFormDecorator } from "../../../storybook/FinalFormStoryFrame";
import { SegmentedControlField } from "../SegmentedControlField";

const meta = {
    title: "Forms/Final Form/SegmentedControlField",
    component: SegmentedControlField,
    decorators: [finalFormDecorator],
    parameters: { initialValues: { layout: "grid" } },
    args: {
        name: "layout",
        "aria-label": "Layout",
        options: [
            { value: "list", label: "List" },
            { value: "grid", label: "Grid" },
            { value: "map", label: "Map" },
        ],
    },
} satisfies Meta<typeof SegmentedControlField>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);

        await userEvent.click(canvas.getByRole("button", { name: "Map" }));
        await expect(canvas.getByText('Values: {"layout":"map"}')).toBeInTheDocument();
    },
};

export const Required: Story = {
    args: { name: "view", required: true, requiredMessage: "Choose a layout" },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);

        await userEvent.click(canvas.getByRole("button", { name: "Submit" }));
        await expect(canvas.getByText("Choose a layout")).toBeVisible();
        await expect(canvas.getByRole("button", { name: "List" })).toHaveFocus();
    },
};
