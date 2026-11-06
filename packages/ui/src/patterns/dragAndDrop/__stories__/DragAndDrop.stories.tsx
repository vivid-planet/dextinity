import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";

import { AssetThumbnail } from "../../../components/assetThumbnail/AssetThumbnail";
import { Block } from "../../../components/blockList/Block";
import { BlockList } from "../../../components/blockList/BlockList";
import { Icon } from "../../../components/icon/Icon";
import { formatShortcut, isApplePlatform } from "../../../components/keyboardShortcut/useKeyboardShortcut";
import { ToastViewport } from "../../../components/toast/ToastViewport";
import { useToasts } from "../../../components/toast/useToasts";
import { type TreeNode, TreeView, type TreeViewMove } from "../../../components/treeView/TreeView";
import { useUndoToast } from "../../../components/undoToast/useUndoToast";
import {
    PatternExample,
    PatternLegend,
    PatternPage,
    PatternRules,
    PatternSection,
    PatternShortcuts,
    PatternSpec,
    PatternSpecs,
} from "../../../storybook/patterns/PatternPage";
import { themeDecorator } from "../../../storybook/themeDecorator";
import styles from "./DragAndDrop.stories.module.scss";

const initialPages: TreeNode[] = [
    { id: "home", label: "Home", status: "published", path: "/" },
    {
        id: "careers",
        label: "Careers",
        type: "folder",
        status: "published",
        path: "/careers",
        children: [
            { id: "jobs", label: "Open positions", status: "published", path: "/careers/jobs" },
            { id: "benefits", label: "Benefits", status: "unpublished", path: "/careers/benefits" },
        ],
    },
    { id: "imprint", label: "Imprint", status: "published", path: "/imprint" },
];

function removeNode(nodes: TreeNode[], id: string): { nodes: TreeNode[]; removed?: TreeNode } {
    let removed: TreeNode | undefined;
    const remaining = nodes
        .filter((node) => {
            if (node.id === id) {
                removed = node;
                return false;
            }
            return true;
        })
        .map((node) => {
            if (removed != null || node.children == null) {
                return node;
            }
            const child = removeNode(node.children, id);
            removed = child.removed;
            return { ...node, children: child.nodes };
        });
    return { nodes: remaining, removed };
}

function insertNode(nodes: TreeNode[], moved: TreeNode, { targetId, position }: TreeViewMove): TreeNode[] {
    return nodes.flatMap((node) => {
        if (node.id === targetId) {
            if (position === "inside") {
                return [{ ...node, children: [...(node.children ?? []), moved] }];
            }
            return position === "before" ? [moved, node] : [node, moved];
        }
        return node.children != null ? [{ ...node, children: insertNode(node.children, moved, { targetId, position, id: moved.id }) }] : [node];
    });
}

function applyMove(nodes: TreeNode[], move: TreeViewMove) {
    const { nodes: remaining, removed } = removeNode(nodes, move.id);
    return removed != null ? insertNode(remaining, removed, move) : nodes;
}

function findLabel(nodes: TreeNode[], id: string): string | undefined {
    for (const node of nodes) {
        if (node.id === id) {
            return node.label;
        }
        const label = node.children != null ? findLabel(node.children, id) : undefined;
        if (label != null) {
            return label;
        }
    }
    return undefined;
}

const initialBlocks = [
    { id: "hero", title: "Hero", icon: <Icon name="image" /> },
    { id: "text", title: "Text", icon: <Icon name="rte-heading" /> },
    { id: "jobs", title: "Job list", icon: <Icon name="list" /> },
];

function moveItem<Item>(items: Item[], fromIndex: number, toIndex: number) {
    const next = [...items];
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);
    return next;
}

function DragAndDropExample() {
    const [pages, setPages] = useState(initialPages);
    const [expandedIds, setExpandedIds] = useState(["careers"]);
    const [selectedId, setSelectedId] = useState<string>();
    const [blocks, setBlocks] = useState(initialBlocks);
    const { toasts, add, dismiss } = useToasts();
    const { perform } = useUndoToast({ addToast: add });

    return (
        <PatternExample>
            <div className={styles.example}>
                <div className={styles.column}>
                    <h3 className={styles.columnTitle}>Page tree</h3>
                    <TreeView
                        aria-label="Pages"
                        nodes={pages}
                        expandedIds={expandedIds}
                        onExpandedChange={setExpandedIds}
                        selectedId={selectedId}
                        onSelect={setSelectedId}
                        draggable
                        onMove={(move) => {
                            const previous = pages;
                            const target = findLabel(pages, move.targetId);
                            perform({
                                run: () => setPages(applyMove(pages, move)),
                                undo: () => setPages(previous),
                                message: `“${findLabel(pages, move.id)}” moved ${move.position === "inside" ? "into" : move.position} “${target}”`,
                                icon: <Icon name="move" />,
                            });
                        }}
                    />
                </div>
                <div className={styles.column}>
                    <h3 className={styles.columnTitle}>Blocks</h3>
                    <BlockList
                        aria-label="Blocks"
                        onReorder={(fromIndex, toIndex) => {
                            const previous = blocks;
                            perform({
                                run: () => setBlocks(moveItem(blocks, fromIndex, toIndex)),
                                undo: () => setBlocks(previous),
                                message: `“${blocks[fromIndex].title}” moved`,
                                icon: <Icon name="move" />,
                            });
                        }}
                    >
                        {blocks.map((block) => (
                            <Block key={block.id} title={block.title} icon={block.icon} visible />
                        ))}
                    </BlockList>
                </div>
            </div>
            <ToastViewport toasts={toasts} onDismiss={dismiss} />
        </PatternExample>
    );
}

const cut = formatShortcut("mod+x");
const paste = formatShortcut("mod+v");

function DragAndDropPage() {
    return (
        <PatternPage>
            <PatternSection
                title="Example"
                description="Live: drag pages in the tree and blocks by their grip – or move them with the keyboard. Each move offers Undo."
            >
                <DragAndDropExample />
            </PatternSection>
            <PatternSection title="Where">
                <PatternLegend
                    items={[
                        { title: "Page tree", description: "Move pages; a line shows where they land, a folder target stands out." },
                        {
                            title: "Finder",
                            description: `Files and folders onto folders, also in the sidebar and path bar. Several with ${formatShortcut("mod+a")[0]}/⇧.`,
                        },
                        { title: "Blocks", description: "Order by the grip." },
                        { title: "Upload", description: "Files from the computer onto the list." },
                    ]}
                />
            </PatternSection>
            <PatternSection title="States">
                <PatternSpecs>
                    <PatternSpec label="Dragged" caption="Original faded">
                        <AssetThumbnail type="folder" className={`${styles.thumbnail} ${styles.dragged}`} />
                    </PatternSpec>
                    <PatternSpec label="Target" caption="Accent frame">
                        <AssetThumbnail type="folder" className={`${styles.thumbnail} ${styles.target}`} />
                    </PatternSpec>
                    <PatternSpec label="Several" caption="Counter at the pointer">
                        <span className={styles.counter}>3 items</span>
                    </PatternSpec>
                </PatternSpecs>
            </PatternSection>
            <PatternShortcuts
                title="Keyboard alternative"
                description="Everything that can be dragged also works through the “Move to …” menu and the keyboard."
                shortcuts={[
                    { keys: [...cut, ...paste], description: "Cut and paste (page tree)" },
                    { keys: ["↑", "↓"], description: "Move a block (on its grip)" },
                    { keys: ["Right-click"], description: "Move to … (finder)" },
                ]}
            />
            <PatternRules
                dos={["Invalid targets don't react.", "After dropping, a toast with Undo."]}
                donts={["Dragging as the only way.", "Letting a folder be dropped into itself."]}
            />
        </PatternPage>
    );
}

const meta = {
    title: "Patterns/Drag & drop",
    decorators: [themeDecorator],
    parameters: {
        docs: {
            description: {
                component:
                    "Moving in the tree, in the finder, and between blocks. `TreeView` (`draggable`), `BlockList` and `AssetBrowser` handle dragging and its keyboard alternative; `useUndoToast` reports each move with Undo.",
            },
        },
    },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

const modKey = isApplePlatform() ? "Meta" : "Control";

/**
 * **Rules**
 *
 * - Do: let invalid targets not react; show a toast with Undo after dropping.
 * - Don't: make dragging the only way; let a folder be dropped into itself.
 */
export const Default: Story = {
    render: () => <DragAndDropPage />,
};

/**
 * The keyboard alternative in the page tree: cut a page, then paste it after the focused one; the toast offers Undo.
 */
export const MoveInTreeWithKeyboard: Story = {
    render: () => <DragAndDropPage />,
    play: async ({ canvas }) => {
        const tree = canvas.getByRole("tree", { name: "Pages" });
        await userEvent.click(within(tree).getByText("Imprint"));
        await userEvent.keyboard(`{${modKey}>}x{/${modKey}}`);
        await userEvent.keyboard("{Home}");
        await userEvent.keyboard(`{Shift>}{${modKey}>}v{/${modKey}}{/Shift}`);
        await waitFor(() => expect(canvas.getByText("“Imprint” moved after “Home”")).toBeVisible());
        const items = within(tree).getAllByRole("treeitem");
        await expect(items[1]).toHaveTextContent("Imprint");

        await userEvent.click(canvas.getByRole("button", { name: "Undo" }));
        await waitFor(() => expect(within(tree).getAllByRole("treeitem")[1]).toHaveTextContent("Careers"));
    },
};

/**
 * Blocks move with the arrow keys on their grip.
 */
export const MoveBlockWithKeyboard: Story = {
    render: () => <DragAndDropPage />,
    play: async ({ canvas }) => {
        const blocks = canvas.getByRole("list", { name: "Blocks" });
        const grips = within(blocks).getAllByRole("button", { name: /Move/ });
        grips[0].focus();
        await userEvent.keyboard("{ArrowDown}");
        await waitFor(() => expect(canvas.getByText("“Hero” moved")).toBeVisible());
        await expect(within(blocks).getAllByRole("listitem")[1]).toHaveTextContent("Hero");
    },
};
