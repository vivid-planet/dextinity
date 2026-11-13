import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, screen, userEvent, waitFor } from "storybook/test";

import { fieldArgTypes, type FieldStoryArgs, splitFieldArgs, StoryField } from "../../../storybook/fieldStoryArgs";
import { landscapeImage } from "../../../storybook/sampleImages";
import { useControlledArg } from "../../../storybook/storyArgs";
import { themeDecorator } from "../../../storybook/themeDecorator";
import { Button } from "../../button/Button";
import { Dialog } from "../../dialog/Dialog";
import { Field } from "../../field/Field";
import fieldTokens from "../../field/Field.tokens.scss?raw";
import { Icon } from "../../icon/Icon";
import { type TreeNode, TreeView } from "../../treeView/TreeView";
import { Picker, type PickerProps } from "../Picker";
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

function renderPage(page: TreeNode) {
    return (
        <>
            <Icon name="file" />
            {page.label}
            <span className={styles.path}>{page.path}</span>
        </>
    );
}

type PickerStoryArgs = PickerProps<TreeNode> & FieldStoryArgs;

/** An application's page picker: the field opens a dialog with the page tree, and choosing a page there sets the value. */
function PagePicker({ onChange, ...args }: PickerStoryArgs & { onChange: (page: TreeNode | null) => void }) {
    const { field, control: props } = splitFieldArgs(args);
    const [open, setOpen] = useState(false);
    const [selectedId, setSelectedId] = useState<string | undefined>(props.value?.id);
    const [expandedIds, setExpandedIds] = useState(["home", "products"]);

    return (
        <div className={styles.narrow}>
            <StoryField field={field}>
                <Picker<TreeNode>
                    {...props}
                    onOpen={() => {
                        props.onOpen();
                        setSelectedId(props.value?.id);
                        setOpen(true);
                    }}
                    onClear={
                        field.required
                            ? undefined
                            : () => {
                                  props.onClear?.();
                                  onChange(null);
                              }
                    }
                />
            </StoryField>
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
                                onChange(selectedId ? (findPage(pages, selectedId) ?? null) : null);
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

const meta = {
    component: Picker,
    title: "Building blocks/Form fields/Picker",
    decorators: [themeDecorator],
    parameters: { tokens: `${pickerTokens}\n${fieldTokens}` },
    args: {
        label: "Link target",
        placeholder: "Choose a page",
        value: null,
        renderValue: renderPage,
        onOpen: fn(),
        onClear: fn(),
        icon: <Icon name="file" />,
    },
    argTypes: {
        value: { control: "object" },
        ...fieldArgTypes,
        renderValue: { control: false },
        icon: { control: false },
        labels: { control: false },
        className: { control: false },
    },
    render: (args, context) => {
        const [value, setValue] = useControlledArg(args, "value", context);
        return <PagePicker {...args} value={value} onChange={setValue} />;
    },
} satisfies Meta<PickerStoryArgs>;

export default meta;

type Story = StoryObj<PickerStoryArgs>;

/**
 * Put it in a `Field` for the label, help, and validation message: `<Field label="Link target"><Picker … /></Field>`.
 *
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
        await expect(args.onOpen).toHaveBeenCalledTimes(1);
        await userEvent.click(await screen.findByText("Backpacks"));
        await userEvent.click(screen.getByRole("button", { name: "Choose" }));
        await waitFor(() => expect(canvas.getByRole("button", { name: /^Link target Backpacks/ })).toBeVisible());
    },
};

/**
 * With a value and `onClear`, a button clears it.
 */
export const WithValue: Story = {
    args: { value: findPage(pages, "about") },
    play: async ({ args, canvas }) => {
        await userEvent.click(canvas.getByRole("button", { name: "Clear" }));
        await waitFor(() => expect(args.onClear).toHaveBeenCalledTimes(1));
        await waitFor(() => expect(canvas.getByRole("button", { name: "Link target Choose a page" })).toBeVisible());
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
                <Field label="Image" disabled={args.disabled} readOnly={args.readOnly} required={args.required}>
                    <Picker<Asset>
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
                </Field>
            </div>
        );
    },
};

export const Error: Story = {
    args: { required: true, state: "error", validationMessage: "Choose the page the link opens." },
    play: async ({ canvas }) => {
        await expect(canvas.getByRole("button", { name: /Link target/ })).toHaveAccessibleDescription("Choose the page the link opens. Required");
    },
};

export const Disabled: Story = {
    args: { value: findPage(pages, "tents"), disabled: true },
};

export const ReadOnly: Story = {
    args: { value: findPage(pages, "tents"), readOnly: true },
    play: async ({ canvas }) => {
        await userEvent.click(canvas.getByRole("button", { name: /^Link target Tents/ }));
        await expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    },
};
