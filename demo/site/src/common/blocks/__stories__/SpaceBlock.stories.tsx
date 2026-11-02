import type { SpaceBlockData } from "@src/blocks.generated";
import { createSpace } from "@src/storybook/blockFixtures";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { SpaceBlock } from "../SpaceBlock";

const spacings: Array<SpaceBlockData["spacing"]> = ["d100", "d200", "d300", "d400", "s100", "s200", "s300", "s400", "s500", "s600"];

const meta: Meta<typeof SpaceBlock> = {
    title: "Blocks/Common/SpaceBlock",
    component: SpaceBlock,
    decorators: [
        (Story) => (
            // The space itself is invisible, so the outline shows its height.
            <div style={{ outline: "1px dashed currentColor" }}>
                <Story />
            </div>
        ),
    ],
    args: {
        data: createSpace("s300"),
    },
};

export default meta;
type Story = StoryObj<typeof SpaceBlock>;

export const Default: Story = {};

export const AllSpacings: Story = {
    decorators: [],
    render: () => (
        <>
            {spacings.map((spacing) => (
                <div key={spacing} style={{ outline: "1px dashed currentColor", marginBottom: 8 }}>
                    {spacing}
                    <SpaceBlock data={createSpace(spacing)} />
                </div>
            ))}
        </>
    ),
};
