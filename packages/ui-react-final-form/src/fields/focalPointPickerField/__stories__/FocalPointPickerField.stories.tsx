import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";

import { finalFormDecorator } from "../../../storybook/FinalFormStoryFrame";
import { sampleImage } from "../../../storybook/sampleImage";
import { FocalPointPickerField } from "../FocalPointPickerField";

const meta = {
    title: "Fields/FocalPointPickerField",
    component: FocalPointPickerField,
    decorators: [finalFormDecorator],
    parameters: { initialValues: { focalPoint: { x: 0.56, y: 0.34 } } },
    args: { name: "focalPoint", src: sampleImage, alt: "Landscape with a sun" },
} satisfies Meta<typeof FocalPointPickerField>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);

        canvas.getByRole("slider").focus();
        await userEvent.keyboard("{ArrowRight}");
        await expect(canvas.getByText('Values: {"focalPoint":{"x":0.57,"y":0.34}}')).toBeInTheDocument();
    },
};
