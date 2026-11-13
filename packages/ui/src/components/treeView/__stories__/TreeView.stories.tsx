import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fireEvent, fn, screen, userEvent, waitFor } from "storybook/test";

import { useControlledArg } from "../../../storybook/storyArgs";
import { themeDecorator } from "../../../storybook/themeDecorator";
import { Icon } from "../../icon/Icon";
import { IconButton } from "../../iconButton/IconButton";
import { type TreeNode, TreeView, type TreeViewMove, type TreeViewProps } from "../TreeView";
import treeViewTokens from "../TreeView.tokens.scss?raw";
import styles from "./TreeView.stories.module.scss";

const pageTree: TreeNode[] = [
    {
        id: "home",
        label: "Home",
        icon: <Icon name="home" />,
        status: "published",
        path: "/",
        count: 8,
        children: [
            {
                id: "careers",
                label: "Careers",
                status: "published",
                path: "/careers",
                count: 3,
                children: [
                    { id: "jobs", label: "Open positions", status: "published", path: "/careers/jobs" },
                    { id: "benefits", label: "Benefits", status: "archived", path: "/careers/benefits" },
                    { id: "apply", label: "How to apply", status: "unpublished", path: "/careers/apply" },
                ],
            },
            {
                id: "products",
                label: "Products",
                status: "published",
                path: "/products",
                count: 2,
                children: [
                    { id: "cms", label: "CMS", status: "published", path: "/products/cms" },
                    { id: "shop", label: "Shop", type: "link", status: "published", path: "https://shop.example.com" },
                ],
            },
            { id: "imprint", label: "Imprint", status: "published", path: "/imprint", hiddenInMenu: true },
        ],
    },
];

function removeNode(nodes: TreeNode[], id: string): { nodes: TreeNode[]; removed?: TreeNode } {
    let removed: TreeNode | undefined;
    const result = nodes
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
    return { nodes: result, removed };
}

function insertNode(nodes: TreeNode[], moved: TreeNode, targetId: string, position: TreeViewMove["position"]): TreeNode[] {
    return nodes.flatMap((node) => {
        if (node.id === targetId) {
            if (position === "inside") {
                return [{ ...node, children: [...(node.children ?? []), moved] }];
            }
            return position === "before" ? [moved, node] : [node, moved];
        }
        return node.children != null ? [{ ...node, children: insertNode(node.children, moved, targetId, position) }] : [node];
    });
}

function applyMove(nodes: TreeNode[], { id, targetId, position }: TreeViewMove) {
    const { nodes: remaining, removed } = removeNode(nodes, id);
    return removed != null ? insertNode(remaining, removed, targetId, position) : nodes;
}

/** Binds expansion, selection, marking, and moves to the story's args. */
function TreeViewWithArgs({ storyId, ...args }: TreeViewProps & { storyId: string }) {
    const context = { id: storyId };
    const [nodes, setNodes] = useControlledArg(args, "nodes", context);
    const [expandedIds, setExpandedIds] = useControlledArg(args, "expandedIds", context);
    const [selectedId, setSelectedId] = useControlledArg(args, "selectedId", context);
    const [checkedIds, setCheckedIds] = useControlledArg(args, "checkedIds", context);
    return (
        <TreeView
            {...args}
            className={styles.tree}
            nodes={nodes}
            expandedIds={expandedIds}
            onExpandedChange={(ids) => {
                args.onExpandedChange(ids);
                setExpandedIds(ids);
            }}
            selectedId={selectedId}
            onSelect={(id) => {
                args.onSelect?.(id);
                setSelectedId(id);
            }}
            checkedIds={checkedIds ?? []}
            onCheckedChange={(ids) => {
                args.onCheckedChange?.(ids);
                setCheckedIds(ids);
            }}
            onMove={(move) => {
                args.onMove?.(move);
                setNodes(applyMove(nodes, move));
            }}
        />
    );
}

const meta = {
    component: TreeView,
    title: "Building blocks/Tree/TreeView",
    decorators: [themeDecorator],
    parameters: { tokens: treeViewTokens },
    args: {
        "aria-label": "Pages",
        nodes: pageTree,
        expandedIds: ["home", "careers"],
        onExpandedChange: fn(),
        onSelect: fn(),
        onOpen: fn(),
        onCheckedChange: fn(),
        onMove: fn(),
    },
    argTypes: {
        nodes: { control: false },
        filter: { control: false },
        canDrop: { control: false },
        renderActions: { control: false },
        className: { control: false },
        slotProps: { control: false },
        labels: { control: false },
    },
    render: (args, context) => <TreeViewWithArgs {...args} storyId={context.id} />,
} satisfies Meta<typeof TreeView>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * The page tree with an active page ("Open positions") and a marked one ("Benefits"). A click shows the detail; a double-click or
 * Enter opens the edit view. Guide lines connect the children of an expanded node; a node with children shows a folder and the number
 * of pages below it.
 *
 * **Rules**
 *
 * - Show the start page with a house, a node with children with a folder, a link with a link symbol, every other page with a page.
 * - Show the status as a dot at the end of the row, with the text in its tooltip.
 * - Show actions on hover and on the active row.
 * - Never put more than one icon before the name.
 * - A click on a row shows the detail first instead of opening the edit view right away.
 */
export const Default: Story = {
    args: {
        selectedId: "jobs",
        checkable: true,
        checkedIds: ["benefits"],
        draggable: true,
        renderActions: (node) => (
            <IconButton color="secondary" aria-label={`Add page below ${node.label}`} size="small" variant="text">
                <Icon name="plus" />
            </IconButton>
        ),
    },
    play: async ({ canvas }) => {
        const tree = canvas.getByRole("tree");
        await userEvent.tab();
        await expect(canvas.getByRole("treeitem", { name: "Open positions" })).toHaveFocus();
        await userEvent.tab();
        await expect(canvas.getByRole("button", { name: "Add page below Open positions" })).toHaveFocus();
        await userEvent.tab();
        await expect(tree).not.toContainElement(document.activeElement as HTMLElement | null);

        await userEvent.tab({ shift: true });
        await userEvent.tab({ shift: true });
        await userEvent.keyboard("{ArrowDown}");
        await userEvent.tab();
        await expect(canvas.getByRole("button", { name: "Add page below Benefits" })).toHaveFocus();
    },
};

/**
 * Without the guide lines along the children, e.g. in a narrow picker where the indentation alone is clear enough.
 */
export const WithoutGuideLines: Story = {
    args: {
        guideLines: false,
        selectedId: "jobs",
    },
};

/**
 * Arrow keys follow the WAI-ARIA tree pattern: ↑ ↓ move, → expands and then enters the first child, ← collapses and then goes to the
 * parent, Home and End jump, a letter jumps to the next name starting with it, `*` expands all siblings. Enter selects and opens.
 */
export const Keyboard: Story = {
    play: async ({ args, canvas }) => {
        await userEvent.tab();
        await expect(canvas.getByRole("treeitem", { name: "Home" })).toHaveFocus();

        await userEvent.keyboard("{ArrowDown}{ArrowDown}");
        const jobs = canvas.getByRole("treeitem", { name: "Open positions" });
        await expect(jobs).toHaveFocus();

        await userEvent.keyboard("{ArrowLeft}");
        const careers = canvas.getByRole("treeitem", { name: "Careers" });
        await expect(careers).toHaveFocus();
        await userEvent.keyboard("{ArrowLeft}");
        await expect(careers).toHaveAttribute("aria-expanded", "false");

        await userEvent.keyboard("{ArrowRight}");
        await expect(careers).toHaveAttribute("aria-expanded", "true");
        await userEvent.keyboard("{ArrowRight}");
        await expect(canvas.getByRole("treeitem", { name: "Open positions" })).toHaveFocus();

        await userEvent.keyboard("i");
        await expect(canvas.getByRole("treeitem", { name: /^Imprint/ })).toHaveFocus();

        await userEvent.keyboard("{Enter}");
        await waitFor(() => expect(args.onSelect).toHaveBeenLastCalledWith("imprint"));
        await waitFor(() => expect(args.onOpen).toHaveBeenLastCalledWith("imprint"));
        await expect(canvas.getByRole("treeitem", { name: /^Imprint/ })).toHaveAttribute("aria-selected", "true");

        await userEvent.dblClick(canvas.getByText("Careers"));
        await waitFor(() => expect(args.onOpen).toHaveBeenLastCalledWith("careers"));
        await expect(careers).toHaveAttribute("aria-expanded", "true");
    },
};

/**
 * With `checkable`, Space marks the focused node and Shift+↑ ↓ extends the marking. Checkboxes show on hover, and on every row once
 * a node is marked.
 */
export const Checkable: Story = {
    args: {
        checkable: true,
    },
    play: async ({ args, canvas }) => {
        await userEvent.click(canvas.getByText("Open positions"));
        await waitFor(() => expect(args.onSelect).toHaveBeenLastCalledWith("jobs"));

        await userEvent.keyboard(" ");
        await waitFor(() => expect(args.onCheckedChange).toHaveBeenLastCalledWith(["jobs"]));
        await userEvent.keyboard("{Shift>}{ArrowDown}{ArrowDown}{/Shift}");
        await waitFor(() => expect(args.onCheckedChange).toHaveBeenLastCalledWith(["jobs", "benefits", "apply"]));
        await expect(canvas.getByRole("treeitem", { name: "How to apply" })).toHaveAttribute("aria-checked", "true");
    },
};

/**
 * While filtering, matching nodes are shown with their ancestors, which are dimmed as context so the location stays clear.
 */
export const Filtered: Story = {
    args: {
        expandedIds: [],
        filter: (node) => node.status === "unpublished" || node.status === "archived",
    },
};

const escapeOutsideTree = fn();

const longNameTree: TreeNode[] = [
    {
        id: "news",
        label: "News",
        type: "folder",
        path: "/news",
        children: [
            {
                id: "announcement",
                label: "Annual report 2026: results, outlook, and the new sustainability strategy",
                status: "published",
                path: "/news/annual-report-2026",
            },
            { id: "event", label: "Open day", status: "unpublished", path: "/news/open-day" },
        ],
    },
];

/**
 * A name that doesn't fit is cut off with an ellipsis. Its full text shows in a tooltip on hover and when the row gets the keyboard
 * focus; Escape hides it.
 */
export const LongNames: Story = {
    args: {
        nodes: longNameTree,
        expandedIds: ["news"],
    },
    render: (args, context) => (
        <div className={styles.narrow} onKeyDown={(event) => event.key === "Escape" && escapeOutsideTree()}>
            <TreeViewWithArgs {...args} storyId={context.id} />
        </div>
    ),
    play: async ({ canvas }) => {
        escapeOutsideTree.mockClear();
        const fullName = "Annual report 2026: results, outlook, and the new sustainability strategy";
        await userEvent.tab();
        await userEvent.keyboard("{ArrowDown}");
        await expect(canvas.getByRole("treeitem", { name: fullName })).toHaveFocus();
        const tooltip = await screen.findByRole("tooltip");
        await expect(tooltip).toHaveTextContent(fullName);

        await userEvent.keyboard("{Escape}");
        await waitFor(() => expect(screen.queryByRole("tooltip")).toBeNull());
        await expect(canvas.getByRole("treeitem", { name: fullName })).toHaveFocus();
        // Hiding the tooltip must not also close a dialog around the tree; the next Escape reaches it
        await expect(escapeOutsideTree).not.toHaveBeenCalled();
        await userEvent.keyboard("{Escape}");
        await expect(escapeOutsideTree).toHaveBeenCalledOnce();

        await userEvent.keyboard("{ArrowDown}");
        await expect(canvas.getByRole("treeitem", { name: "Open day" })).toHaveFocus();
        await expect(screen.queryByRole("tooltip")).toBeNull();

        const row = canvas.getByRole("treeitem", { name: fullName }).firstElementChild as HTMLElement;
        await userEvent.hover(row);
        await waitFor(() => expect(screen.getByRole("tooltip")).toHaveTextContent(fullName));
        await userEvent.unhover(row);
        await waitFor(() => expect(screen.queryByRole("tooltip")).toBeNull());
    },
};

/**
 * With `draggable`, nodes move by dragging: the upper or lower quarter of a row drops before or after it, the middle inside it.
 * A node can't be dropped on itself or its descendants.
 */
export const DragAndDrop: Story = {
    args: {
        draggable: true,
    },
    play: async ({ args, canvas }) => {
        const source = canvas.getByText("How to apply").closest<HTMLElement>("[draggable]");
        const target = canvas.getByText("Open positions").closest<HTMLElement>("[draggable]");
        if (source == null || target == null) {
            throw new Error("Rows not found");
        }
        const dataTransfer = new DataTransfer();
        const rect = target.getBoundingClientRect();
        fireEvent.dragStart(source, { dataTransfer });
        fireEvent.dragOver(target, { dataTransfer, clientY: rect.top + 2 });
        await waitFor(() => expect(target).toHaveAttribute("data-drop", "before"));
        await expect(canvas.getByRole("treeitem", { name: "Open positions" })).toHaveAttribute("data-drop", "before");
        fireEvent.drop(target, { dataTransfer, clientY: rect.top + 2 });
        await waitFor(() => expect(args.onMove).toHaveBeenCalledWith({ id: "apply", targetId: "jobs", position: "before" }));

        const careers = canvas.getByRole("treeitem", { name: "Careers" });
        const childNames = [...careers.querySelectorAll('[role="group"] > [role="treeitem"]')].map((item) => item.getAttribute("data-id"));
        await expect(childNames).toStrictEqual(["apply", "jobs", "benefits"]);
    },
};

/**
 * Dragging is never the only way: with `draggable`, Ctrl/⌘+X cuts the focused node, Ctrl/⌘+V moves it inside the focused node as
 * its last child, Shift+Ctrl/⌘+V right after it. Escape cancels; invalid targets don't react.
 */
export const KeyboardMove: Story = {
    args: {
        draggable: true,
    },
    play: async ({ args, canvas }) => {
        await userEvent.click(canvas.getByText("Imprint"));
        await userEvent.keyboard("{Control>}x{/Control}");
        await expect(canvas.getByText("Imprint").closest("[data-cut]")).not.toBeNull();

        await userEvent.keyboard("{Home}{ArrowDown}");
        await userEvent.keyboard("{Shift>}{Control>}v{/Control}{/Shift}");
        await waitFor(() => expect(args.onMove).toHaveBeenLastCalledWith({ id: "imprint", targetId: "careers", position: "after" }));

        await userEvent.keyboard("{Control>}x{/Control}");
        await userEvent.keyboard("{ArrowDown}{Control>}v{/Control}");
        await waitFor(() => expect(args.onMove).toHaveBeenCalledTimes(1));
        await userEvent.keyboard("{Escape}");
        await expect(canvas.getByText("Careers").closest("[data-cut]")).toBeNull();
    },
};
