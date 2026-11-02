import { createDamImage, createSvgDamImage, emptyDamImage } from "@src/storybook/blockFixtures";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { DamImageBlock } from "../DamImageBlock";

const aspectRatios = ["inherit", "16x9", "4x3", "3x2", "3x1", "2x1", "1x1", "1x2", "1x3", "2x3", "3x4", "9x16"];

const meta: Meta<typeof DamImageBlock> = {
    title: "Blocks/Common/DamImageBlock",
    component: DamImageBlock,
    argTypes: {
        aspectRatio: { control: "select", options: aspectRatios },
    },
    args: {
        data: createDamImage(),
        aspectRatio: "16x9",
    },
};

export default meta;
type Story = StoryObj<typeof DamImageBlock>;

export const PixelImage: Story = {};

export const InheritedAspectRatio: Story = {
    args: { data: createDamImage({ width: 1200, height: 1600 }), aspectRatio: "inherit" },
};

export const SvgImage: Story = {
    args: { data: createSvgDamImage() },
};

export const Empty: Story = {
    args: { data: emptyDamImage },
};
