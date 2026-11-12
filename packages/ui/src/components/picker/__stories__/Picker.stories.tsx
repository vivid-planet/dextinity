import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, screen, userEvent, waitFor } from "storybook/test";

import { modalOverlayDocs } from "../../../storybook/docsPopups";
import { landscapeImage } from "../../../storybook/sampleImages";
import { themeDecorator } from "../../../storybook/themeDecorator";
import { Button } from "../../button/Button";
import { Dialog } from "../../dialog/Dialog";
import fieldTokens from "../../field/Field.tokens.scss?raw";
import { Icon } from "../../icon/Icon";
import { type TreeNode, TreeView } from "../../treeView/TreeView";
import { Picker } from "../Picker";
import pickerTokens from "../Picker.tokens.scss?raw";
import styles from "./Picker.stories.module.scss";

const pages: TreeNode[] = [
    {
        id: "home",
        label: "Home",
        path: "/",
        children: [
            {
                id: "products",
                label: "Products",
                path: "/products",
                children: [
                    { id: "tents", label: "Tents", path: "/products/tents" },
                    { id: "backpacks", label: "Backpacks", path: "/products/backpacks" },
                ],
            },
            { id: "about", label: "About us", path: "/about" },
            { id: "contact", label: "Contact", path: "/contact" },
        ],
    },
];

function findPage(nodes: TreeNode[], id: string): TreeNode | undefined {
    for (const node of nodes) {
        if (node.id === id) {
            return node;
        }
        const child = node.children && findPage(node.children, id);
        if (child) {
            return child;
        }
    }
    return undefined;
}

interface StoryArgs {
    onChange: (value: unknown) => void;
    disabled?: boolean;
    readOnly?: boolean;
    required?: boolean;
}

/** An application's page picker: the field opens a dialog with the page tree. */
function PagePicker({ onChange, initialPageId = null, ...props }: StoryArgs & { initialPageId?: string | null }) {
    const [page, setPage] = useState<TreeNode | null>(initialPageId ? (findPage(pages, initialPageId) ?? null) : null);
    const [open, setOpen] = useState(false);
    const [selectedId, setSelectedId] = useState<string | undefined>(page?.id);
    const [expandedIds, setExpandedIds] = useState(["home", "products"]);
    const choose = (next: TreeNode | null) => {
        setPage(next);
        onChange(next?.id ?? null);
    };

    return (
        <div className={styles.narrow}>
            <Picker<TreeNode>
                {...props}
                label="Link target"
                placeholder="Choose a page"
                value={page}
                renderValue={(value) => (
                    <>
                        <Icon name="file" />
                        {value.label}
                        <span className={styles.path}>{value.path}</span>
                    </>
                )}
                onOpen={() => {
                    setSelectedId(page?.id);
                    setOpen(true);
                }}
                onClear={props.required ? undefined : () => choose(null)}
                icon={<Icon name="file" />}
            />
            <Dialog
                open={open}
                onOpenChange={setOpen}
                title="Choose a page"
                footer={
                    <>
                        <Button variant="text" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            disabled={selectedId == null}
                            onClick={() => {
                                choose(selectedId ? (findPage(pages, selectedId) ?? null) : null);
                                setOpen(false);
                            }}
                        >
                            Choose
                        </Button>
                    </>
                }
            >
                <TreeView
                    aria-label="Pages"
                    nodes={pages}
                    expandedIds={expandedIds}
                    onExpandedChange={setExpandedIds}
                    selectedId={selectedId}
                    onSelect={setSelectedId}
                />
            </Dialog>
        </div>
    );
}

const meta: Meta<StoryArgs> = {
    title: "Building blocks/Form fields/Picker",
    decorators: [themeDecorator],
    parameters: { tokens: `${pickerTokens}\n${fieldTokens}`, docs: modalOverlayDocs("560px") },
    args: { onChange: fn() },
    render: (args) => <PagePicker {...args} />,
};

export default meta;

type Story = StoryObj<StoryArgs>;

/**
 * **Rules**
 * - Use it for values chosen in a picker the application provides, e.g. a dialog with the page tree or the assets; for a list of
 *   options, use a select or combobox.
 * - The field only shows the value (`renderValue`) and asks to open the picker (`onOpen`); the application owns the picker and sets
 *   `value` from it.
 * - Offer `onClear` when the value is optional.
 */
export const Default: Story = {
    play: async ({ args, canvas }) => {
        const trigger = canvas.getByRole("button", { name: "Link target Choose a page" });
        await userEvent.click(trigger);
        await userEvent.click(await screen.findByText("Backpacks"));
        await userEvent.click(screen.getByRole("button", { name: "Choose" }));
        await waitFor(() => expect(args.onChange).toHaveBeenCalledWith("backpacks"));
        await expect(canvas.getByRole("button", { name: /^Link target Backpacks/ })).toBeVisible();
    },
};

/**
 * With a value and `onClear`, a button clears it.
 */
export const WithValue: Story = {
    render: (args) => <PagePicker {...args} initialPageId="about" />,
    play: async ({ args, canvas }) => {
        await userEvent.click(canvas.getByRole("button", { name: "Clear" }));
        await waitFor(() => expect(args.onChange).toHaveBeenCalledWith(null));
        await expect(canvas.getByRole("button", { name: "Link target Choose a page" })).toBeVisible();
    },
};

interface Asset {
    id: string;
    name: string;
    url: string;
}

/**
 * `renderValue` can show more than text, e.g. a file's thumbnail.
 */
export const File: Story = {
    render: (args) => {
        const file: Asset = { id: "1", name: "mountain-lake.jpg", url: landscapeImage };
        return (
            <div className={styles.narrow}>
                <Picker<Asset>
                    {...args}
                    label="Image"
                    value={file}
                    renderValue={(value) => (
                        <>
                            <img className={styles.thumbnail} src={value.url} alt="" />
                            {value.name}
                        </>
                    )}
                    onOpen={fn()}
                    onClear={fn()}
                    icon={<Icon name="image" />}
                />
            </div>
        );
    },
};

export const Error: Story = {
    args: { required: true },
    render: (args) => (
        <div className={styles.narrow}>
            <Picker
                {...args}
                label="Link target"
                placeholder="Choose a page"
                value={null}
                renderValue={() => null}
                onOpen={fn()}
                state="error"
                validationMessage="Choose the page the link opens."
            />
        </div>
    ),
    play: async ({ canvas }) => {
        await expect(canvas.getByRole("button", { name: /Link target/ })).toHaveAccessibleDescription("Choose the page the link opens.");
    },
};

export const Disabled: Story = {
    render: (args) => <PagePicker {...args} initialPageId="tents" disabled />,
};

export const ReadOnly: Story = {
    render: (args) => <PagePicker {...args} initialPageId="tents" readOnly />,
    play: async ({ canvas }) => {
        await userEvent.click(canvas.getByRole("button", { name: /^Link target Tents/ }));
        await expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    },
};
