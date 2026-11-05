import type { Meta, StoryObj } from "@storybook/react-vite";
import { type ReactNode, useState } from "react";
import { expect, fn, userEvent, waitFor } from "storybook/test";

import { themeDecorator } from "../../../storybook/themeDecorator";
import { Icon } from "../../icon/Icon";
import { IconButton } from "../../iconButton/IconButton";
import blockListTokens from "../_tokens.scss?raw";
import { Block } from "../Block";
import { BlockList, type BlockListProps } from "../BlockList";
import styles from "./BlockList.stories.module.scss";

interface SampleBlock {
    id: string;
    title: string;
    summary: string;
    icon: ReactNode;
    visible: boolean;
}

const initialBlocks: SampleBlock[] = [
    { id: "hero", title: "Shape what's next", summary: "Hero · Image · Title · Text", icon: <Icon name="image" />, visible: true },
    { id: "teasers", title: "Why join us", summary: "Teaser grid · 3 teasers", icon: <Icon name="blocks" />, visible: true },
    { id: "jobs", title: "Open positions", summary: "Job list · 12 jobs", icon: <Icon name="list" />, visible: true },
    { id: "contact", title: "Get in touch", summary: "Contact form", icon: <Icon name="form" />, visible: false },
];

function moveItem<Item>(items: Item[], fromIndex: number, toIndex: number) {
    const next = [...items];
    const [item] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, item);
    return next;
}

/** Keeps the story controlled: order, visibility, selection, and added blocks live in local state. */
function ControlledBlockList(props: BlockListProps) {
    const [blocks, setBlocks] = useState(initialBlocks);
    const [selectedId, setSelectedId] = useState<string>();
    return (
        <div className={styles.container}>
            <BlockList
                {...props}
                onReorder={
                    props.onReorder &&
                    ((fromIndex, toIndex) => {
                        props.onReorder?.(fromIndex, toIndex);
                        setBlocks((current) => moveItem(current, fromIndex, toIndex));
                    })
                }
                onAdd={
                    props.onAdd &&
                    ((index) => {
                        props.onAdd?.(index);
                        const id = `text-${Date.now()}`;
                        setBlocks((current) => [
                            ...current.slice(0, index),
                            { id, title: "New text", summary: "Text", icon: <Icon name="heading" />, visible: true },
                            ...current.slice(index),
                        ]);
                        setSelectedId(id);
                    })
                }
            >
                {blocks.map((block) => (
                    <Block
                        key={block.id}
                        title={block.title}
                        summary={block.summary}
                        icon={block.icon}
                        visible={block.visible}
                        onVisibleChange={(visible) =>
                            setBlocks((current) => current.map((item) => (item.id === block.id ? { ...item, visible } : item)))
                        }
                        selected={block.id === selectedId}
                        onSelect={() => setSelectedId(block.id)}
                        actions={
                            <IconButton size="small" aria-label="More actions">
                                <Icon name="more" />
                            </IconButton>
                        }
                    />
                ))}
            </BlockList>
        </div>
    );
}

const meta = {
    component: BlockList,
    title: "Building blocks/Blocks & preview/BlockList",
    decorators: [themeDecorator],
    parameters: { tokens: blockListTokens },
    args: {
        "aria-label": "Blocks",
        onReorder: fn(),
        onAdd: fn(),
    },
    argTypes: {
        children: { control: false },
        labels: { control: false },
        className: { control: false },
        slotProps: { control: false },
    },
    render: (args) => <ControlledBlockList {...args} />,
} satisfies Meta<typeof BlockList>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * Drag a block by its grip, or focus the grip and press the arrow keys (Home and End move to the top and bottom). Hover between
 * two blocks to insert one there.
 *
 * **Rules**
 *
 * - The order is controlled: apply `onReorder` to your blocks.
 * - Don't nest blocks deeper than three levels.
 * - Never mix up the page status and a block's visibility.
 */
export const Default: Story = {
    play: async ({ args, canvas }) => {
        const [firstGrip] = canvas.getAllByRole("button", { name: "Move" });
        firstGrip.focus();
        await userEvent.keyboard("{ArrowDown}");
        await expect(args.onReorder).toHaveBeenLastCalledWith(0, 1);
        const titles = () => canvas.getAllByRole("button", { pressed: false, name: /·/ }).map((button) => button.textContent);
        await expect(titles()[0]).toContain("Why join us");
        await waitFor(() => expect(canvas.getAllByRole("button", { name: "Move" })[1]).toHaveFocus());

        await userEvent.click(canvas.getByRole("button", { name: "Add block" }));
        await expect(args.onAdd).toHaveBeenLastCalledWith(4);
        await expect(canvas.getByRole("button", { name: /New text/ })).toHaveAttribute("aria-pressed", "true");
    },
};

/**
 * Without `onReorder` and `onAdd`, the list only shows the blocks: no grips, no add buttons.
 */
export const Static: Story = {
    args: { onReorder: undefined, onAdd: undefined },
};

/**
 * The insert buttons between blocks pass the index the new block goes to.
 */
export const InsertBetween: Story = {
    play: async ({ args, canvas }) => {
        const [firstInsert] = canvas.getAllByRole("button", { name: "Insert block here" });
        await userEvent.click(firstInsert);
        await expect(args.onAdd).toHaveBeenLastCalledWith(1);
    },
};
