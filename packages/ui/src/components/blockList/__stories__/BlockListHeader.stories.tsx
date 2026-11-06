import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, userEvent, waitFor } from "storybook/test";

import { themeDecorator } from "../../../storybook/themeDecorator";
import { Icon } from "../../icon/Icon";
import { IconButton } from "../../iconButton/IconButton";
import { Tooltip } from "../../tooltip/Tooltip";
import blockListTokens from "../_tokens.scss?raw";
import { BlockListHeader, type BlockListHeaderProps } from "../BlockListHeader";
import styles from "./BlockList.stories.module.scss";

/** Keeps the story controlled: select all sets the selected count to all blocks or none. */
function ControlledBlockListHeader(props: BlockListHeaderProps) {
    const [selectedCount, setSelectedCount] = useState(props.selectedCount);
    return (
        <div className={styles.container}>
            <BlockListHeader
                {...props}
                selectedCount={selectedCount}
                onSelectAllChange={(selected) => {
                    props.onSelectAllChange(selected);
                    setSelectedCount(selected ? props.count : 0);
                }}
                actions={
                    <>
                        <Tooltip content="Hide">
                            <IconButton size="small" aria-label="Hide" disabled={selectedCount === 0}>
                                <Icon name="eye-off" />
                            </IconButton>
                        </Tooltip>
                        <Tooltip content="Delete">
                            <IconButton size="small" aria-label="Delete" disabled={selectedCount === 0}>
                                <Icon name="trash" />
                            </IconButton>
                        </Tooltip>
                    </>
                }
            />
        </div>
    );
}

const meta = {
    component: BlockListHeader,
    title: "Building blocks/Blocks & preview/BlockListHeader",
    decorators: [themeDecorator],
    parameters: { tokens: blockListTokens },
    args: {
        count: 8,
        selectedCount: 0,
        onSelectAllChange: fn(),
    },
    argTypes: {
        actions: { control: false },
        labels: { control: false },
        className: { control: false },
        slotProps: { control: false },
    },
    render: (args) => <ControlledBlockListHeader {...args} />,
} satisfies Meta<typeof BlockListHeader>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * The checkbox selects all blocks or clears the selection; the count switches to the number of selected blocks.
 *
 * **Rules**
 *
 * - Put it in the `header` of the `BlockList` whose blocks it selects.
 * - Disable the actions that need a selection while nothing is selected; keep Paste enabled.
 */
export const Default: Story = {
    play: async ({ args, canvas }) => {
        await userEvent.click(canvas.getByRole("checkbox", { name: "Select all blocks" }));
        await waitFor(() => expect(args.onSelectAllChange).toHaveBeenLastCalledWith(true));
        await expect(canvas.getByText("8 selected")).toBeVisible();
        await expect(canvas.getByRole("button", { name: "Delete" })).toBeEnabled();
    },
};

/**
 * With some blocks selected, the checkbox is mixed; clicking it selects all.
 */
export const PartlySelected: Story = {
    args: { selectedCount: 3 },
    play: async ({ args, canvas }) => {
        const checkbox = canvas.getByRole("checkbox", { name: "Select all blocks" });
        await expect(checkbox).toHaveAttribute("aria-checked", "mixed");
        await userEvent.click(checkbox);
        await waitFor(() => expect(args.onSelectAllChange).toHaveBeenLastCalledWith(true));
    },
};
