import type { Meta, StoryObj } from "@storybook/react-vite";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { expect, fireEvent, fn, userEvent, waitFor, within } from "storybook/test";

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
    { id: "contact", title: "Get in touch", summary: "Contact form", icon: <Icon name="edit-page" />, visible: false },
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
                                {action("Show", <Icon name="eye" />, () => setVisible(true))}
                                {action("Hide", <Icon name="eye-off" />, () => setVisible(false))}
                                {action("Copy", <Icon name="copy" />, () => undefined)}
                                {action("Paste", <Icon name="paste-add" />, () => undefined, false)}
                                {action("Delete", <Icon name="trash" />, () => {
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
        await userEvent.click(canvas.getByRole("radio", { name: "Section 12" }));
        const block = canvasElement.querySelector<HTMLElement>('[data-block-key="block-12"]');
        await expect(block).toHaveAttribute("data-selected");
        const scroller = block?.closest<HTMLElement>(`.${styles.scroller}`);
        await waitFor(() => expect(scroller?.scrollTop).toBeGreaterThan(0));
    },
};

interface NestedColumn {
    id: string;
    title: string;
    blocks: SampleBlock[];
}

const initialColumns: NestedColumn[] = [
    {
        id: "left",
        title: "Left column",
        blocks: [
            { id: "left-heading", title: "Our values", summary: "Heading", icon: <Icon name="heading" />, visible: true },
            { id: "left-text", title: "We build for people", summary: "Text", icon: <Icon name="edit-page" />, visible: true },
            { id: "left-image", title: "Team at work", summary: "Image", icon: <Icon name="image" />, visible: true },
        ],
    },
    {
        id: "right",
        title: "Right column",
        blocks: [{ id: "right-quote", title: "“Best team ever”", summary: "Quote", icon: <Icon name="edit-page" />, visible: true }],
    },
];

/** Keeps the story controlled: the outer order, each column's blocks, and the expanded blocks live in local state. */
function NestedBlockList(listProps: BlockListProps) {
    const [columns, setColumns] = useState(initialColumns);
    const [expandedIds, setExpandedIds] = useState(["left"]);
    const updateBlocks = (columnId: string, update: (blocks: SampleBlock[]) => SampleBlock[]) =>
        setColumns((current) => current.map((column) => (column.id === columnId ? { ...column, blocks: update(column.blocks) } : column)));

    return (
        <div className={styles.container}>
            <BlockList
                {...listProps}
                onReorder={(fromIndex, toIndex) => {
                    listProps.onReorder?.(fromIndex, toIndex);
                    setColumns((current) => moveItem(current, fromIndex, toIndex));
                }}
                onAdd={undefined}
            >
                {columns.map((column) => (
                    <Block
                        key={column.id}
                        title={column.title}
                        summary={`Column · ${column.blocks.length === 1 ? "1 block" : `${column.blocks.length} blocks`}`}
                        icon={<Icon name="columns-3" />}
                        visible
                        expanded={expandedIds.includes(column.id)}
                        onExpandedChange={(expanded) =>
                            setExpandedIds((current) => (expanded ? [...current, column.id] : current.filter((id) => id !== column.id)))
                        }
                    >
                        <BlockList
                            aria-label={`Blocks of ${column.title}`}
                            onReorder={(fromIndex, toIndex) => updateBlocks(column.id, (blocks) => moveItem(blocks, fromIndex, toIndex))}
                            onAdd={(index) =>
                                updateBlocks(column.id, (blocks) => [
                                    ...blocks.slice(0, index),
                                    {
                                        id: `${column.id}-${Date.now()}`,
                                        title: "New text",
                                        summary: "Text",
                                        icon: <Icon name="heading" />,
                                        visible: true,
                                    },
                                    ...blocks.slice(index),
                                ])
                            }
                        >
                            {column.blocks.map((block) => (
                                <Block key={block.id} title={block.title} summary={block.summary} icon={block.icon} visible={block.visible} />
                            ))}
                        </BlockList>
                    </Block>
                ))}
            </BlockList>
        </div>
    );
}

function titlesOf(list: HTMLElement) {
    return within(list)
        .getAllByRole("listitem")
        .filter((item) => item.parentElement === list)
        .map((item) => item.querySelector("[class*='title']")?.textContent)
        .filter((title) => title != null);
}

/**
 * A block's fields can hold a `BlockList` of its own, e.g. the blocks of a column, with its own insert buttons and moving. Each list
 * moves only its own blocks, by keyboard and by dragging; a block dragged over a nested list lands in the list it came from.
 */
export const NestedBlocks: Story = {
    render: (args) => <NestedBlockList {...args} />,
    play: async ({ args, canvas }) => {
        const outer = canvas.getByRole("list", { name: "Blocks" });
        const nested = canvas.getByRole("list", { name: "Blocks of Left column" });

        // The keyboard moves a nested block within its column
        within(nested).getAllByRole("button", { name: "Move" })[0].focus();
        await userEvent.keyboard("{ArrowDown}");
        await waitFor(() => expect(titlesOf(nested)).toStrictEqual(["We build for people", "Our values", "Team at work"]));
        await expect(args.onReorder).not.toHaveBeenCalled();
        await waitFor(() => expect(within(nested).getAllByRole("button", { name: "Move" })[1]).toHaveFocus());

        // Dragging a nested block within its column
        const dataTransfer = new DataTransfer();
        const nestedItems = () =>
            within(nested)
                .getAllByRole("listitem")
                .filter((item) => item.parentElement === nested && item.querySelector("[class*='title']"));
        fireEvent.dragStart(within(nestedItems()[2]).getByRole("button", { name: "Move" }), { dataTransfer });
        const target = nestedItems()[0];
        const rect = target.getBoundingClientRect();
        fireEvent.dragOver(target, { dataTransfer, clientX: rect.left + 10, clientY: rect.top + 2 });
        fireEvent.drop(target, { dataTransfer, clientX: rect.left + 10, clientY: rect.top + 2 });
        await waitFor(() => expect(titlesOf(nested)).toStrictEqual(["Team at work", "We build for people", "Our values"]));
        await expect(args.onReorder).not.toHaveBeenCalled();

        // An outer block dragged over a nested block moves in the outer list
        const outerItems = () =>
            within(outer)
                .getAllByRole("listitem")
                .filter((item) => item.parentElement === outer);
        fireEvent.dragStart(within(outerItems()[1]).getAllByRole("button", { name: "Move" })[0], { dataTransfer });
        const nestedTarget = nestedItems()[0];
        const nestedRect = nestedTarget.getBoundingClientRect();
        fireEvent.dragOver(nestedTarget, { dataTransfer, clientX: nestedRect.left + 10, clientY: nestedRect.top + 2 });
        await waitFor(() => expect(outerItems()[0]).toHaveAttribute("data-drop", "before"));
        await expect(nestedTarget).not.toHaveAttribute("data-drop");
        fireEvent.drop(nestedTarget, { dataTransfer, clientX: nestedRect.left + 10, clientY: nestedRect.top + 2 });
        await waitFor(() => expect(args.onReorder).toHaveBeenLastCalledWith(1, 0));
        await expect(titlesOf(outer)).toStrictEqual(["Right column", "Left column"]);
    },
};
