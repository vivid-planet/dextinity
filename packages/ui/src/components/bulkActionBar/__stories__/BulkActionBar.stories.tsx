import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, userEvent, waitFor } from "storybook/test";

import { themeDecorator } from "../../../storybook/themeDecorator";
import { Button } from "../../button/Button";
import { Icon } from "../../icon/Icon";
import bulkActionBarTokens from "../_tokens.scss?raw";
import { BulkActionBar, type BulkActionBarProps } from "../BulkActionBar";

/** Keeps the story controlled: clearing sets the count to 0, "Select 3" brings the bar back. */
function ControlledBulkActionBar(props: BulkActionBarProps) {
    const [count, setCount] = useState(props.count);
    return (
        <>
            <BulkActionBar
                {...props}
                count={count}
                onClear={() => {
                    props.onClear();
                    setCount(0);
                }}
            />
            {count === 0 && (
                <Button variant="outlined" size="small" onClick={() => setCount(3)}>
                    Select 3
                </Button>
            )}
        </>
    );
}

const meta = {
    component: BulkActionBar,
    title: "Building blocks/Tables & paging/BulkActionBar",
    decorators: [themeDecorator],
    parameters: { tokens: bulkActionBarTokens },
    args: {
        count: 3,
        actions: [
            { label: "Publish", icon: <Icon name="check" />, onClick: fn() },
            { label: "Archive", icon: <Icon name="archive" />, onClick: fn() },
            { label: "Delete", icon: <Icon name="trash" />, color: "error", onClick: fn() },
        ],
        onClear: fn(),
    },
    argTypes: {
        actions: { control: false },
        className: { control: false },
        slotProps: { control: false },
        labels: { control: false },
    },
    render: (args) => <ControlledBulkActionBar {...args} />,
} satisfies Meta<typeof BulkActionBar>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * Appears at the bottom of a list while items are selected, with their number and the actions for all of them. `DataGrid` shows it
 * through its `bulkActions` prop.
 *
 * **Rules**
 *
 * - Offer only actions that apply to every selected item.
 * - Clearing the selection (✕ or Escape) hides the bar.
 */
export const Default: Story = {
    play: async ({ args, canvas }) => {
        await userEvent.click(canvas.getByRole("button", { name: "Archive" }));
        await waitFor(() => expect(args.actions[1].onClick).toHaveBeenCalled());
    },
};

/**
 * Escape clears the selection while focus is in the bar; the bar fades out.
 */
export const ClearWithEscape: Story = {
    play: async ({ args, canvas }) => {
        await userEvent.click(canvas.getByRole("button", { name: "Archive" }));
        await userEvent.keyboard("{Escape}");
        await waitFor(() => expect(args.onClear).toHaveBeenCalledTimes(1));
        await expect(canvas.getByRole("toolbar", { hidden: true })).not.toHaveAttribute("data-open");
    },
};

/**
 * Arrow keys move between the actions; the bar is one tab stop.
 */
export const Keyboard: Story = {
    play: async ({ args, canvas }) => {
        await userEvent.tab();
        await expect(canvas.getByRole("button", { name: "Publish" })).toHaveFocus();
        await userEvent.keyboard("{ArrowRight}");
        await expect(canvas.getByRole("button", { name: "Archive" })).toHaveFocus();
        await userEvent.keyboard("{ArrowRight}{ArrowRight}");
        await expect(canvas.getByRole("button", { name: "Clear selection" })).toHaveFocus();
        await userEvent.keyboard("{Enter}");
        await waitFor(() => expect(args.onClear).toHaveBeenCalled());
    },
};

/**
 * A disabled action doesn't apply to the current selection.
 */
export const DisabledAction: Story = {
    args: {
        count: 12,
        actions: [
            { label: "Publish", icon: <Icon name="check" />, onClick: fn() },
            { label: "Translate", icon: <Icon name="translate" />, disabled: true, onClick: fn() },
        ],
    },
};
