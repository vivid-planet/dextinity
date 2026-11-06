import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { themeDecorator } from "../../../storybook/themeDecorator";
import { Skeleton } from "../Skeleton";
import skeletonTokens from "../Skeleton.tokens.scss?raw";
import styles from "./Skeleton.stories.module.scss";

const meta = {
    component: Skeleton,
    title: "Building blocks/Loading & save state/Skeleton",
    decorators: [themeDecorator],
    parameters: { tokens: skeletonTokens },
    args: {
        count: 3,
    },
    argTypes: {
        variant: { control: "radio", options: ["text", "row", "tile", "block"] },
        width: { control: "text" },
        className: { control: false },
        slotProps: { control: false },
    },
} satisfies Meta<typeof Skeleton>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * Lines of text that are loading.
 *
 * **Rules**
 *
 * - Show nothing for the first 300 ms; most loads are faster.
 * - Match the shape and size of the content that is coming.
 * - Set `aria-busy` on the loading area; the skeleton itself is hidden from assistive technology.
 * - Don't cover the whole page with a loading overlay.
 */
export const Default: Story = {
    play: async ({ canvasElement }) => {
        const root = canvasElement.querySelector(".dextinitySkeleton");
        await expect(root).toHaveAttribute("aria-hidden", "true");
    },
};

/**
 * Rows of a list or tree: selection, name, and a short value at the end.
 */
export const Row: Story = {
    args: { variant: "row", count: 4, width: 620 },
};

/**
 * Metrics and cards on the overview.
 */
export const Tile: Story = {
    args: { variant: "tile", count: 1 },
    render: (args) => (
        <div className={styles.tiles}>
            <Skeleton {...args} />
            <Skeleton {...args} />
            <Skeleton {...args} />
        </div>
    ),
};

/**
 * Larger areas, e.g. a preview or an image.
 */
export const Block: Story = {
    args: { variant: "block", count: 1, width: 480 },
};

/**
 * The loading area carries `aria-busy`, so assistive technology waits for the content.
 */
export const InLoadingArea: Story = {
    args: { variant: "row", count: 4 },
    render: (args) => (
        <section aria-busy="true" aria-label="Recently edited" className={styles.area}>
            <Skeleton {...args} />
        </section>
    ),
    play: async ({ canvas }) => {
        await expect(canvas.getByRole("region", { name: "Recently edited" })).toHaveAttribute("aria-busy", "true");
    },
};
