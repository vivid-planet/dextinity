import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, userEvent, waitFor } from "storybook/test";

import { themeDecorator } from "../../../storybook/themeDecorator";
import { Icon } from "../../icon/Icon";
import { getExpandableTreeNodeIds, type TreeNode, TreeView } from "../../treeView/TreeView";
import { TreeViewExpandButtons } from "../TreeViewExpandButtons";
import treeViewExpandButtonsTokens from "../TreeViewExpandButtons.tokens.scss?raw";
import styles from "./TreeViewExpandButtons.stories.module.scss";

const pageTree: TreeNode[] = [
    {
        id: "home",
        label: "Home",
        icon: <Icon name="home" />,
        count: 5,
        children: [
            {
                id: "careers",
                label: "Careers",
                count: 2,
                children: [
                    { id: "jobs", label: "Open positions" },
                    { id: "benefits", label: "Benefits" },
                ],
            },
            { id: "about", label: "About us", count: 1, children: [{ id: "team", label: "Team" }] },
        ],
    },
];

const expandableIds = getExpandableTreeNodeIds(pageTree);

const meta = {
    component: TreeViewExpandButtons,
    title: "Building blocks/Tree/TreeViewExpandButtons",
    decorators: [themeDecorator],
    parameters: { tokens: treeViewExpandButtonsTokens },
    args: {
        onExpandAll: fn(),
        onCollapseAll: fn(),
    },
    argTypes: {
        expandAllDisabled: { control: "boolean" },
        collapseAllDisabled: { control: "boolean" },
        labels: { control: false },
        className: { control: false },
        slotProps: { control: false },
    },
} satisfies Meta<typeof TreeViewExpandButtons>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * **Rules**
 *
 * - Place them at the end of the tree's toolbar.
 * - Disable the one that would change nothing.
 */
export const Default: Story = {};

/**
 * Expands and collapses every node of a `TreeView`; the button that would change nothing is disabled.
 */
export const WithTreeView: Story = {
    render: function Render(args) {
        const [expandedIds, setExpandedIds] = useState<string[]>(["home"]);
        return (
            <div className={styles.frame}>
                <div className={styles.toolbar}>
                    <TreeViewExpandButtons
                        {...args}
                        onExpandAll={() => {
                            args.onExpandAll();
                            setExpandedIds(expandableIds);
                        }}
                        onCollapseAll={() => {
                            args.onCollapseAll();
                            setExpandedIds([]);
                        }}
                        expandAllDisabled={expandedIds.length === expandableIds.length}
                        collapseAllDisabled={expandedIds.length === 0}
                    />
                </div>
                <TreeView aria-label="Pages" nodes={pageTree} expandedIds={expandedIds} onExpandedChange={setExpandedIds} />
            </div>
        );
    },
    play: async ({ args, canvas }) => {
        await userEvent.click(canvas.getByRole("button", { name: "Expand all" }));
        await expect(args.onExpandAll).toHaveBeenCalledOnce();
        await expect(canvas.getByRole("treeitem", { name: "Team" })).toBeVisible();
        await expect(canvas.getByRole("button", { name: "Expand all" })).toBeDisabled();

        await userEvent.click(canvas.getByRole("button", { name: "Collapse all" }));
        await expect(args.onCollapseAll).toHaveBeenCalledOnce();
        await waitFor(() => expect(canvas.queryByText("Careers")).toBeNull());
        await expect(canvas.getByRole("button", { name: "Collapse all" })).toBeDisabled();
    },
};
