import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fireEvent, fn, userEvent, waitFor } from "storybook/test";

import { themeDecorator } from "../../../storybook/themeDecorator";
import { Icon } from "../../icon/Icon";
import { IconButton } from "../../iconButton/IconButton";
import treeViewTokens from "../_tokens.scss?raw";
import { type TreeNode, TreeView, type TreeViewMove, type TreeViewProps } from "../TreeView";
import styles from "./TreeView.stories.module.scss";

const pageTree: TreeNode[] = [
    {
        id: "home",
        label: "Home",
        icon: <Icon name="home" />,
        status: "published",
        path: "/",
        children: [
            {
                id: "careers",
                label: "Careers",
                type: "folder",
                status: "published",
                path: "/careers",
                children: [
                    { id: "jobs", label: "Open positions", status: "published", path: "/careers/jobs" },
                    { id: "benefits", label: "Benefits", status: "archived", path: "/careers/benefits" },
                    { id: "apply", label: "How to apply", status: "unpublished", path: "/careers/apply" },
                ],
            },
            {
                id: "products",
                label: "Products",
                type: "folder",
                status: "published",
                path: "/products",
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

/** Keeps the story controlled: expansion, selection, marking, and moves update local state; the args set the initial values. */
function ControlledTreeView(props: TreeViewProps) {
    const [nodes, setNodes] = useState(props.nodes);
    const [expandedIds, setExpandedIds] = useState(props.expandedIds);
    const [selectedId, setSelectedId] = useState(props.selectedId);
    const [checkedIds, setCheckedIds] = useState(props.checkedIds ?? []);
    return (
        <TreeView
            {...props}
            className={styles.tree}
            nodes={nodes}
            expandedIds={expandedIds}
            onExpandedChange={(ids) => {
                props.onExpandedChange(ids);
                setExpandedIds(ids);
            }}
            selectedId={selectedId}
            onSelect={(id) => {
                props.onSelect?.(id);
                setSelectedId(id);
            }}
            checkedIds={checkedIds}
            onCheckedChange={(ids) => {
                props.onCheckedChange?.(ids);
                setCheckedIds(ids);
            }}
            onMove={(move) => {
                props.onMove?.(move);
                setNodes((previous) => applyMove(previous, move));
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
    render: (args) => <ControlledTreeView {...args} />,
} satisfies Meta<typeof TreeView>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * The page tree with an active page ("Open positions") and a marked one ("Benefits"). A click shows the detail; Enter opens the edit
 * view.
 *
 * **Rules**
 *
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
