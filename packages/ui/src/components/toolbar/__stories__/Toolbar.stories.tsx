import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, screen, userEvent, within } from "storybook/test";

import { themeDecorator } from "../../../storybook/themeDecorator";
import { Icon } from "../../icon/Icon";
import { MenuRadioGroup } from "../../menu/MenuRadioGroup";
import { MenuRadioItem } from "../../menu/MenuRadioItem";
import { Toolbar, type ToolbarProps } from "../Toolbar";
import toolbarTokens from "../Toolbar.tokens.scss?raw";
import { ToolbarButton } from "../ToolbarButton";
import { ToolbarGroup } from "../ToolbarGroup";
import { ToolbarMenu } from "../ToolbarMenu";
import { ToolbarSeparator } from "../ToolbarSeparator";
import styles from "./Toolbar.stories.module.scss";

const blockTypes = { paragraph: "Paragraph", heading2: "Heading 2", heading3: "Heading 3" };

type Mark = "bold" | "italic" | "underline";

/** A text editor's toolbar: the block type as a menu, marks as toggles, lists, and undo as a plain action. */
function EditorToolbar(props: Omit<ToolbarProps, "children">) {
    const [blockType, setBlockType] = useState<keyof typeof blockTypes>("paragraph");
    const [menuOpen, setMenuOpen] = useState(false);
    const [marks, setMarks] = useState<Record<Mark, boolean>>({ bold: true, italic: false, underline: false });
    const toggle = (mark: Mark) => setMarks((current) => ({ ...current, [mark]: !current[mark] }));

    return (
        <Toolbar {...props}>
            <ToolbarMenu label={blockTypes[blockType]} aria-label="Text style" open={menuOpen} onOpenChange={setMenuOpen}>
                <MenuRadioGroup value={blockType} onChange={(value) => setBlockType(value as keyof typeof blockTypes)}>
                    {Object.entries(blockTypes).map(([value, label]) => (
                        <MenuRadioItem key={value} value={value} label={label} />
                    ))}
                </MenuRadioGroup>
            </ToolbarMenu>
            <ToolbarSeparator />
            <ToolbarGroup aria-label="Marks">
                <ToolbarButton aria-label="Bold" shortcut="⌘B" pressed={marks.bold} onClick={() => toggle("bold")}>
                    <Icon name="bold" />
                </ToolbarButton>
                <ToolbarButton aria-label="Italic" shortcut="⌘I" pressed={marks.italic} onClick={() => toggle("italic")}>
                    <Icon name="italic" />
                </ToolbarButton>
                <ToolbarButton aria-label="Link" shortcut="⌘K" onClick={fn()}>
                    <Icon name="link-diagonal" />
                </ToolbarButton>
            </ToolbarGroup>
            <ToolbarSeparator />
            <ToolbarGroup aria-label="Lists">
                <ToolbarButton aria-label="Bulleted list" pressed={false} onClick={fn()}>
                    <Icon name="list" />
                </ToolbarButton>
                <ToolbarButton aria-label="Numbered list" pressed={false} onClick={fn()}>
                    <Icon name="list-ordered" />
                </ToolbarButton>
            </ToolbarGroup>
            <ToolbarSeparator />
            <ToolbarButton aria-label="Undo" shortcut="⌘Z" onClick={fn()}>
                <Icon name="history" />
            </ToolbarButton>
        </Toolbar>
    );
}

const meta = {
    component: Toolbar,
    title: "Building blocks/Buttons/Toolbar",
    decorators: [
        themeDecorator,
        (Story) => (
            <div className={styles.stage}>
                <div className={styles.surface}>
                    <Story />
                </div>
            </div>
        ),
    ],
    parameters: { tokens: toolbarTokens },
    args: { "aria-label": "Formatting", children: null },
    argTypes: {
        orientation: { control: "radio", options: ["horizontal", "vertical"] },
        disabled: { control: "boolean" },
        children: { control: false },
        className: { control: false },
    },
    render: ({ children: _children, ...args }) => <EditorToolbar {...args} />,
} satisfies Meta<typeof Toolbar>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * Build an editor's toolbar from `ToolbarMenu`, `ToolbarButton`, `ToolbarGroup`, and `ToolbarSeparator`.
 *
 * **Rules**
 * - Group related controls and separate the groups.
 * - Every button names its action; add the shortcut where there is one.
 */
export const Default: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const bold = canvas.getByRole("button", { name: "Bold" });
        await expect(bold).toHaveAttribute("aria-pressed", "true");

        await userEvent.click(bold);
        await expect(bold).toHaveAttribute("aria-pressed", "false");

        await userEvent.keyboard("{ArrowRight}");
        await expect(canvas.getByRole("button", { name: "Italic" })).toHaveFocus();

        await userEvent.click(canvas.getByRole("button", { name: "Text style" }));
        await userEvent.click(await screen.findByRole("menuitemradio", { name: "Heading 2" }));
        await expect(canvas.getByRole("button", { name: "Text style" })).toHaveTextContent("Heading 2");
    },
};

/**
 * Stacks the controls, e.g. along the side of a canvas. Arrow up and down move between them.
 */
export const Vertical: Story = {
    args: { orientation: "vertical" },
};

/**
 * Disables every control while they stay focusable, e.g. while the editor is read-only.
 */
export const Disabled: Story = {
    args: { disabled: true },
};
