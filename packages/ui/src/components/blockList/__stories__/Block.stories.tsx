import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, userEvent, waitFor } from "storybook/test";

import { useControlledArg } from "../../../storybook/storyArgs";
import { themeDecorator } from "../../../storybook/themeDecorator";
import { Field } from "../../field/Field";
import { Icon } from "../../icon/Icon";
import { IconButton } from "../../iconButton/IconButton";
import { Input } from "../../input/Input";
import { Block } from "../Block";
import { BlockList } from "../BlockList";
import blockListTokens from "../BlockList.tokens.scss?raw";
import styles from "./BlockList.stories.module.scss";

function HeroFields() {
    const [title, setTitle] = useState("Shape what's next");
    const [text, setText] = useState("Careers at Example Inc.");
    return (
        <>
            <Field label="Title">
                <Input name="title" value={title} onChange={(event) => setTitle(event.target.value)} />
            </Field>
            <Field label="Text">
                <Input name="text" value={text} onChange={(event) => setText(event.target.value)} />
            </Field>
        </>
    );
}

const meta = {
    component: Block,
    title: "Building blocks/Blocks & preview/Block",
    decorators: [themeDecorator],
    parameters: { tokens: blockListTokens },
    args: {
        title: "Shape what's next",
        summary: "Hero · Image · Title · Text",
        icon: <Icon name="image" />,
        visible: true,
        onVisibleChange: fn(),
        onExpandedChange: fn(),
    },
    argTypes: {
        selected: { control: "boolean" },
        expanded: { control: "boolean" },
        invalid: { control: "boolean" },
        checked: { control: "boolean" },
        icon: { control: false },
        actions: { control: false },
        children: { control: false },
        labels: { control: false },
        className: { control: false },
        slotProps: { control: false },
    },
    render: (args, context) => {
        const [visible, setVisible] = useControlledArg(args, "visible", context);
        const [expanded, setExpanded] = useControlledArg(args, "expanded", context);
        const [checked, setChecked] = useControlledArg(args, "checked", context);
        return (
            <div className={styles.container}>
                <BlockList aria-label="Blocks">
                    <Block
                        {...args}
                        visible={visible}
                        onVisibleChange={
                            args.onVisibleChange &&
                            ((next) => {
                                args.onVisibleChange?.(next);
                                setVisible(next);
                            })
                        }
                        checked={checked}
                        onCheckedChange={
                            args.onCheckedChange &&
                            ((next) => {
                                args.onCheckedChange?.(next);
                                setChecked(next);
                            })
                        }
                        expanded={expanded}
                        onExpandedChange={(next) => {
                            args.onExpandedChange?.(next);
                            setExpanded(next);
                        }}
                    />
                </BlockList>
            </div>
        );
    },
} satisfies Meta<typeof Block>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * The header shows the grip (inside a reorderable `BlockList`), the type's icon, title, summary, the eye, actions, and the toggle
 * for the fields.
 *
 * **Rules**
 *
 * - Take the title from the content (the first heading); show the type in the summary.
 * - The eye is independent of the page status: a hidden block stays saved but is never live, even on published pages.
 */
export const Default: Story = {
    args: { expanded: false, children: <HeroFields /> },
    play: async ({ args, canvas }) => {
        await userEvent.click(canvas.getByRole("button", { name: "Fields" }));
        await waitFor(() => expect(args.onExpandedChange).toHaveBeenLastCalledWith(true));
        await expect(await canvas.findByRole("textbox", { name: "Title" })).toBeVisible();
        await userEvent.click(canvas.getByRole("button", { name: "Hide" }));
        await waitFor(() => expect(args.onVisibleChange).toHaveBeenLastCalledWith(false));
        await expect(canvas.getByRole("button", { name: "Hide" })).toHaveAttribute("aria-pressed", "true");
        await expect(canvas.getByText("Hidden")).toBeVisible();
    },
};

export const Expanded: Story = {
    args: { expanded: true, children: <HeroFields /> },
};

/**
 * Hidden blocks are marked the same way in the list and in the preview.
 */
export const Hidden: Story = {
    args: { title: "Contact form", summary: "Form", icon: <Icon name="edit-page" />, visible: false },
};

/**
 * Selected in sync with the preview. Blocks with nested blocks open in the panel instead of expanding: leave out `expanded` and
 * handle `onSelect`.
 */
export const Selected: Story = {
    args: {
        title: "Teaser grid",
        summary: "3 teasers",
        icon: <Icon name="blocks" />,
        selected: true,
        onSelect: fn(),
        actions: (
            <IconButton variant="text" color="secondary" size="small" aria-label="More actions">
                <Icon name="more-horizontal" />
            </IconButton>
        ),
    },
    render: (args) => (
        <div className={styles.container}>
            <BlockList aria-label="Blocks">
                <Block {...args} />
            </BlockList>
        </div>
    ),
    play: async ({ args, canvas }) => {
        await userEvent.click(canvas.getByRole("button", { name: /Teaser grid/ }));
        await expect(args.onSelect).toHaveBeenCalledOnce();
    },
};

/**
 * Without `onVisibleChange` there is no eye, e.g. for readers without edit rights.
 */
export const ReadOnly: Story = {
    args: { onVisibleChange: undefined },
};

/**
 * `invalid` marks a block with errors, e.g. a required field is empty; `invalidReason` says which, in the marker's tooltip.
 */
export const Invalid: Story = {
    args: { invalid: true, invalidReason: "Image is required", expanded: false, children: <HeroFields /> },
    play: async ({ canvas }) => {
        const marker = canvas.getByRole("img", { name: "Image is required" });
        await userEvent.tab();
        marker.focus();
        await expect(marker).toHaveFocus();
    },
};

/**
 * A selected block that is invalid keeps the selection ring, with the error ring inside it.
 */
export const SelectedAndInvalid: Story = {
    args: { selected: true, onSelect: fn(), invalid: true, invalidReason: "Image is required" },
};

/**
 * With `checked` and `onCheckedChange`, the block has a checkbox to select it for bulk actions, independent of `selected`, which
 * follows the preview.
 */
export const Checkable: Story = {
    args: { checked: false, onCheckedChange: fn() },
    play: async ({ args, canvas }) => {
        const checkbox = canvas.getByRole("checkbox", { name: "Select" });
        await expect(checkbox).toHaveAccessibleDescription("Shape what's next");
        await userEvent.click(checkbox);
        await waitFor(() => expect(args.onCheckedChange).toHaveBeenLastCalledWith(true));
        await expect(checkbox).toBeChecked();
    },
};
