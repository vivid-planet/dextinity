import { SliderBlock } from "@src/documents/pages/blocks/SliderBlock";
import { createImageMedia, createListItems, createRichText, loremIpsum } from "@src/storybook/blockFixtures";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";

function createSliderItem(title: string, seed: string) {
    return { media: createImageMedia({ seed }), text: createRichText({ text: title, type: "header-three" }, loremIpsum) };
}

const meta: Meta<typeof SliderBlock> = {
    title: "Blocks/Pages/SliderBlock",
    component: SliderBlock,
    args: {
        data: {
            blocks: createListItems([
                createSliderItem("First slide", "slider-1"),
                createSliderItem("Second slide", "slider-2"),
                createSliderItem("Third slide", "slider-3"),
                createSliderItem("Fourth slide", "slider-4"),
                createSliderItem("Fifth slide", "slider-5"),
            ]),
        },
    },
};

export default meta;
type Story = StoryObj<typeof SliderBlock>;

export const Default: Story = {};

export const Navigation: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);

        // Depending on the viewport, several slides are in view and the status shows a range, e.g. "1–3 of 5".
        const status = canvas.getByText(/^1(–\d)? of 5$/);
        const initialStatus = status.textContent;

        await userEvent.click(canvas.getByRole("button", { name: "Next slide" }));
        await waitFor(() => expect(status.textContent).not.toBe(initialStatus));
    },
};
