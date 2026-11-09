import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, userEvent, waitFor } from "storybook/test";

import { themeDecorator } from "../../../storybook/themeDecorator";
import { Button } from "../../button/Button";
import { Checkbox } from "../../checkbox/Checkbox";
import { Drawer } from "../../drawer/Drawer";
import { Icon } from "../../icon/Icon";
import { BlockPicker, type BlockPickerCategory, type BlockPickerItem, type BlockPickerProps } from "../BlockPicker";
import blockPickerTokens from "../BlockPicker.tokens.scss?raw";
import styles from "./BlockPicker.stories.module.scss";

const categories: BlockPickerCategory[] = [
    { value: "text", label: "Text" },
    { value: "media", label: "Media" },
    { value: "teasers", label: "Teasers" },
    { value: "forms", label: "Forms" },
];

const items: BlockPickerItem[] = [
    { value: "heading", label: "Heading", description: "A title for a section", icon: <Icon name="rte-heading" />, category: "text" },
    { value: "richText", label: "Rich text", description: "Paragraphs, lists, and links", icon: <Icon name="rte-bold" />, category: "text" },
    { value: "image", label: "Image", description: "One picture with an optional caption", icon: <Icon name="image" />, category: "media" },
    { value: "gallery", label: "Gallery", description: "Several pictures to swipe through", icon: <Icon name="assets" />, category: "media" },
    {
        value: "stage",
        label: "Stage",
        description: "Large picture with title at the top of a page",
        icon: <Icon name="layout" />,
        category: "media",
        keywords: ["hero"],
    },
    { value: "video", label: "Video", description: "YouTube, Vimeo, or an uploaded video", icon: <Icon name="play" />, category: "media" },
    { value: "teaserGrid", label: "Teaser grid", description: "Three to six teasers side by side", icon: <Icon name="grid" />, category: "teasers" },
    { value: "teaserList", label: "Teaser list", description: "Teasers below each other", icon: <Icon name="list" />, category: "teasers" },
    { value: "contactForm", label: "Contact form", description: "Name, email, and message", icon: <Icon name="edit-record" />, category: "forms" },
    { value: "spacer", label: "Space", description: "Empty space between blocks", icon: <Icon name="maximize" /> },
];

/** Keeps the story controlled: search and category live in local state. */
function ControlledBlockPicker(props: BlockPickerProps) {
    const [query, setQuery] = useState(props.query);
    const [category, setCategory] = useState(props.category ?? null);
    return (
        <div className={styles.container}>
            <BlockPicker
                {...props}
                query={query}
                onQueryChange={(next) => {
                    props.onQueryChange(next);
                    setQuery(next);
                }}
                category={category}
                onCategoryChange={(next) => {
                    props.onCategoryChange?.(next);
                    setCategory(next);
                }}
            />
        </div>
    );
}

const meta = {
    component: BlockPicker,
    title: "Building blocks/Blocks & preview/BlockPicker",
    decorators: [themeDecorator],
    parameters: { tokens: blockPickerTokens },
    args: {
        items,
        categories,
        recent: ["teaserGrid", "image"],
        query: "",
        onQueryChange: fn(),
        onCategoryChange: fn(),
        onSelect: fn(),
    },
    argTypes: {
        items: { control: false },
        categories: { control: false },
        labels: { control: false },
        className: { control: false },
        slotProps: { control: false },
    },
    render: (args) => <ControlledBlockPicker {...args} />,
} satisfies Meta<typeof BlockPicker>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * Type to search: Enter adds the first match, the arrow keys move through the results.
 *
 * **Rules**
 *
 * - Offer only the block types allowed at the insert position.
 * - Keep the recently used to a handful, most recent first.
 */
export const Default: Story = {
    play: async ({ args, canvas }) => {
        const search = canvas.getByRole("searchbox", { name: "Search blocks" });
        await userEvent.type(search, "hero");
        await waitFor(() => expect(canvas.getByRole("button", { name: /Stage/ })).toHaveAttribute("data-highlighted"));
        await userEvent.keyboard("{Enter}");
        await expect(args.onSelect).toHaveBeenLastCalledWith("stage");

        await userEvent.clear(search);
        await userEvent.keyboard("{ArrowDown}");
        await expect(canvas.getAllByRole("button", { name: /Teaser grid/ })[0]).toHaveFocus();
        await userEvent.keyboard("{ArrowDown}");
        await expect(canvas.getAllByRole("button", { name: /^Image/ })[0]).toHaveFocus();
    },
};

/**
 * A category filter shows only that category's block types.
 */
export const FilteredByCategory: Story = {
    args: { category: "media" },
    play: async ({ args, canvas }) => {
        await userEvent.click(canvas.getByRole("button", { name: "Forms" }));
        await waitFor(() => expect(args.onCategoryChange).toHaveBeenLastCalledWith("forms"));
        await expect(canvas.getByRole("button", { name: /Contact form/ })).toBeVisible();
        await expect(canvas.queryByRole("button", { name: /Gallery/ })).toBeNull();
    },
};

export const NoMatch: Story = {
    args: { query: "carousel" },
};

/**
 * Without categories, the block types show in one list.
 */
export const WithoutCategories: Story = {
    args: { categories: undefined, recent: undefined },
};

/** Opens the picker from an add button, as the page editor does. */
function DrawerBlockPicker(props: BlockPickerProps) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [editAfterAdding, setEditAfterAdding] = useState(true);
    return (
        <>
            <Button startIcon={<Icon name="plus" />} onClick={() => setOpen(true)}>
                Add block
            </Button>
            <Drawer open={open} onOpenChange={setOpen} title="Add block">
                <BlockPicker
                    {...props}
                    query={query}
                    onQueryChange={setQuery}
                    category={undefined}
                    onCategoryChange={undefined}
                    onSelect={(value) => {
                        props.onSelect(value);
                        setOpen(false);
                        setQuery("");
                    }}
                >
                    <Checkbox checked={editAfterAdding} onChange={setEditAfterAdding}>
                        Edit after adding
                    </Checkbox>
                    <p className={styles.insertionHint}>Will be inserted at the end of the page.</p>
                </BlockPicker>
            </Drawer>
        </>
    );
}

/**
 * In the page editor, the add buttons of the `BlockList` open the picker in a `Drawer`; choosing a block type closes it. The
 * categories group the block types without filters, and the children offer to edit the new block right away and tell where it goes.
 */
export const InDrawer: Story = {
    render: (args) => <DrawerBlockPicker {...args} />,
    play: async ({ args, canvas, canvasElement }) => {
        await userEvent.click(canvas.getByRole("button", { name: "Add block" }));
        const body = canvasElement.ownerDocument.body;
        const option = await waitFor(() => {
            const button = body.querySelector<HTMLButtonElement>('[role="dialog"] button[data-value="video"]');
            if (button == null) {
                throw new Error("The picker isn't open yet");
            }
            return button;
        });
        await userEvent.click(option);
        await expect(args.onSelect).toHaveBeenLastCalledWith("video");
    },
};
