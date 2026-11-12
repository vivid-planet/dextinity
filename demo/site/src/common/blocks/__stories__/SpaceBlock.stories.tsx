import type { SpaceBlockData } from "@src/blocks.generated";
import { SpaceBlock } from "@src/common/blocks/SpaceBlock";
import { createSpace } from "@src/storybook/blockFixtures";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import clsx from "clsx";

import styles from "./SpaceBlock.stories.module.scss";

const spacings: Array<SpaceBlockData["spacing"]> = ["d100", "d200", "d300", "d400", "s100", "s200", "s300", "s400", "s500", "s600"];

const meta: Meta<typeof SpaceBlock> = {
    title: "Blocks/Common/SpaceBlock",
    component: SpaceBlock,
    args: {
        data: createSpace("s300"),
    },
};

export default meta;
type Story = StoryObj<typeof SpaceBlock>;

export const Default: Story = {
    render: (args) => (
        <div className={styles.outline}>
            <SpaceBlock {...args} />
        </div>
    ),
};

export const AllSpacings: Story = {
    render: () => (
        <>
            {spacings.map((spacing) => (
                <div key={spacing} className={clsx(styles.outline, styles.spacing)}>
                    {spacing}
                    <SpaceBlock data={createSpace(spacing)} />
                </div>
            ))}
        </>
    ),
};
