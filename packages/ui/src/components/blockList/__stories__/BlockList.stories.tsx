import type { Meta, StoryObj } from "@storybook/react-vite";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { expect, fn, userEvent, waitFor } from "storybook/test";

import { themeDecorator } from "../../../storybook/themeDecorator";
import { Icon } from "../../icon/Icon";
import { IconButton } from "../../iconButton/IconButton";
import { SegmentedControl } from "../../segmentedControl/SegmentedControl";
import { Tooltip } from "../../tooltip/Tooltip";
import { Block } from "../Block";
import { BlockList, type BlockListProps } from "../BlockList";
import blockListTokens from "../BlockList.tokens.scss?raw";
import { BlockListHeader } from "../BlockListHeader";
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
    { id: "contact", title: "Get in touch", summary: "Contact form", icon: <Icon name="edit-record" />, visible: false },
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
                            { id, title: "New text", summary: "Text", icon: <Icon name="rte-heading" />, visible: true },
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
                            <IconButton variant="text" color="secondary" size="small" aria-label="More actions">
                                <Icon name="more-horizontal" />
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
        header: { control: false },
        labels: { control: false },
        className: { control: false },
        slotProps: { control: false },
    },
    render: (args) => <ControlledBlockList {...args} />,
} satisfies Meta<typeof BlockList>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * Drag a block by its grip, or focus the grip and press the arrow keys (Home and End move to the top and bottom). Hover above the
 * first block or between two blocks to insert one there.
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
        await waitFor(() => expect(args.onReorder).toHaveBeenLastCalledWith(0, 1));
        const titles = () => canvas.getAllByRole("button", { pressed: false, name: /·/ }).map((button) => button.textContent);
        await expect(titles()[0]).toContain("Why join us");
        await waitFor(() => expect(canvas.getAllByRole("button", { name: "Move" })[1]).toHaveFocus());

        await userEvent.click(canvas.getByRole("button", { name: "Add block" }));
        await waitFor(() => expect(args.onAdd).toHaveBeenLastCalledWith(4));
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
 * The insert buttons before the first block and between blocks pass the index the new block goes to.
 */
export const InsertBetween: Story = {
    play: async ({ args, canvas }) => {
        const [beforeFirst, betweenFirstAndSecond] = canvas.getAllByRole("button", { name: "Insert block here" });
        await userEvent.click(betweenFirstAndSecond);
        await waitFor(() => expect(args.onAdd).toHaveBeenLastCalledWith(1));
        await userEvent.click(beforeFirst);
        await waitFor(() => expect(args.onAdd).toHaveBeenLastCalledWith(0));
    },
};

/** Blocks with checkboxes and a header with the bulk actions; the selection lives in local state. */
function BulkActionsBlockList(props: BlockListProps) {
    const [blocks, setBlocks] = useState(initialBlocks);
    const [checkedIds, setCheckedIds] = useState<string[]>([]);
    const hasSelection = checkedIds.length > 0;
    const setVisible = (visible: boolean) =>
        setBlocks((current) => current.map((block) => (checkedIds.includes(block.id) ? { ...block, visible } : block)));
    const action = (label: string, icon: ReactNode, onClick: () => void, disabled = !hasSelection) => (
        <Tooltip content={label}>
            <IconButton variant="text" color="secondary" size="small" aria-label={label} disabled={disabled} onClick={onClick}>
                {icon}
            </IconButton>
        </Tooltip>
    );

    return (
        <div className={styles.container}>
            <BlockList
                {...props}
                header={
                    <BlockListHeader
                        count={blocks.length}
                        selectedCount={checkedIds.length}
                        onSelectAllChange={(selected) => setCheckedIds(selected ? blocks.map((block) => block.id) : [])}
                        actions={
                            <>
                                {action("Show", <Icon name="visible" />, () => setVisible(true))}
                                {action("Hide", <Icon name="invisible" />, () => setVisible(false))}
                                {action("Copy", <Icon name="copy" />, () => undefined)}
                                {action("Paste", <Icon name="paste" />, () => undefined, false)}
                                {action("Delete", <Icon name="delete" />, () => {
                                    setBlocks((current) => current.filter((block) => !checkedIds.includes(block.id)));
                                    setCheckedIds([]);
                                })}
                            </>
                        }
                    />
                }
            >
                {blocks.map((block) => (
                    <Block
                        key={block.id}
                        title={block.title}
                        summary={block.summary}
                        icon={block.icon}
                        visible={block.visible}
                        checked={checkedIds.includes(block.id)}
                        onCheckedChange={(checked) =>
                            setCheckedIds((current) => (checked ? [...current, block.id] : current.filter((id) => id !== block.id)))
                        }
                        invalid={block.id === "jobs"}
                        invalidReason="Choose at least one job category"
                    />
                ))}
            </BlockList>
        </div>
    );
}

/**
 * Give the blocks `checked` and `onCheckedChange`, and put a `BlockListHeader` in `header`: it selects all blocks and holds the bulk
 * actions, e.g. show, hide, copy, paste, and delete.
 */
export const BulkActions: Story = {
    args: { onAdd: undefined },
    render: (args) => <BulkActionsBlockList {...args} />,
    play: async ({ canvas }) => {
        await expect(canvas.getByText("4 blocks")).toBeVisible();
        await expect(canvas.getByRole("button", { name: "Hide" })).toBeDisabled();

        await userEvent.click(canvas.getByRole("checkbox", { name: "Select all blocks" }));
        await expect(canvas.getByText("4 selected")).toBeVisible();
        await userEvent.click(canvas.getAllByRole("checkbox", { name: "Select" })[0]);
        await expect(canvas.getByText("3 selected")).toBeVisible();
        await expect(canvas.getByRole("checkbox", { name: "Select all blocks" })).toHaveAttribute("aria-checked", "mixed");

        await userEvent.click(canvas.getByRole("button", { name: "Delete" }));
        await expect(canvas.getByText("1 block")).toBeVisible();
    },
};

/** A preview stand-in: choosing a block there selects it in the list and scrolls it into view. */
function PreviewSyncBlockList(props: BlockListProps) {
    const blocks = Array.from({ length: 12 }, (_, index) => ({
        id: `block-${index + 1}`,
        title: `Section ${index + 1}`,
        summary: "Text · Image",
    }));
    const [selectedId, setSelectedId] = useState(blocks[0].id);
    const blockRefs = useRef(new Map<string, HTMLLIElement>());

    useEffect(() => {
        blockRefs.current.get(selectedId)?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }, [selectedId]);

    return (
        <div className={styles.syncLayout}>
            <SegmentedControl
                size="small"
                aria-label="Selected in the preview"
                value={selectedId}
                onChange={setSelectedId}
                options={[0, 5, 11].map((index) => ({ value: blocks[index].id, label: blocks[index].title }))}
            />
            <div className={styles.scroller}>
                <BlockList {...props}>
                    {blocks.map((block) => (
                        <Block
                            key={block.id}
                            ref={(element) => {
                                if (element != null) {
                                    blockRefs.current.set(block.id, element);
                                } else {
                                    blockRefs.current.delete(block.id);
                                }
                            }}
                            data-block-key={block.id}
                            title={block.title}
                            summary={block.summary}
                            icon={<Icon name="file" />}
                            visible
                            selected={block.id === selectedId}
                            onSelect={() => setSelectedId(block.id)}
                        />
                    ))}
                </BlockList>
            </div>
        </div>
    );
}

/**
 * A `Block`'s ref and attributes go to its list item: keep refs by block, or set `data-block-key`, to scroll the block selected in the
 * preview into view.
 */
export const PreviewSync: Story = {
    args: { onAdd: undefined, onReorder: undefined },
    render: (args) => <PreviewSyncBlockList {...args} />,
    play: async ({ canvas, canvasElement }) => {
        await userEvent.click(canvas.getByRole("button", { name: "Section 12" }));
        const block = canvasElement.querySelector<HTMLElement>('[data-block-key="block-12"]');
        await expect(block).toHaveAttribute("data-selected");
        const scroller = block?.closest<HTMLElement>(`.${styles.scroller}`);
        await waitFor(() => expect(scroller?.scrollTop).toBeGreaterThan(0));
    },
};
