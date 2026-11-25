import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, screen, userEvent, within } from "storybook/test";

import { themeDecorator } from "../../../storybook/themeDecorator";
import { Icon } from "../../icon/Icon";
import { MenuRadioGroup } from "../../menu/MenuRadioGroup";
import { MenuRadioItem } from "../../menu/MenuRadioItem";
import { Toolbar } from "../Toolbar";
import { ToolbarButton } from "../ToolbarButton";
import { ToolbarGroup } from "../ToolbarGroup";
import { ToolbarMenu } from "../ToolbarMenu";
import { ToolbarSeparator } from "../ToolbarSeparator";
import styles from "./Toolbar.stories.module.scss";

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
    args: { "aria-label": "Formatting", children: null },
    argTypes: {
        orientation: { control: "radio", options: ["horizontal", "vertical"] },
        disabled: { control: "boolean" },
        children: { control: false },
        className: { control: false },
    },
    render: (args) => {
        const [blockType, setBlockType] = useState("Paragraph");
        const [isBlockTypeMenuOpen, setIsBlockTypeMenuOpen] = useState(false);
        const [isBold, setIsBold] = useState(true);
        const [isItalic, setIsItalic] = useState(false);
        const [listType, setListType] = useState<"bulleted" | "numbered" | null>(null);
        return (
            <Toolbar {...args}>
                <ToolbarMenu label={blockType} aria-label="Text style" open={isBlockTypeMenuOpen} onOpenChange={setIsBlockTypeMenuOpen}>
                    <MenuRadioGroup value={blockType} onChange={setBlockType}>
                        <MenuRadioItem value="Paragraph" label="Paragraph" />
                        <MenuRadioItem value="Heading 2" label="Heading 2" />
                        <MenuRadioItem value="Heading 3" label="Heading 3" />
                    </MenuRadioGroup>
                </ToolbarMenu>
                <ToolbarSeparator />
                <ToolbarGroup aria-label="Marks">
                    <ToolbarButton aria-label="Bold" keyboardShortcut="mod+b" selected={isBold} onSelectedChange={setIsBold}>
                        <Icon name="bold" />
                    </ToolbarButton>
                    <ToolbarButton aria-label="Italic" keyboardShortcut="mod+i" selected={isItalic} onSelectedChange={setIsItalic}>
                        <Icon name="italic" />
                    </ToolbarButton>
                    <ToolbarButton aria-label="Link" keyboardShortcut="mod+k" onClick={fn()}>
                        <Icon name="link-diagonal" />
                    </ToolbarButton>
                </ToolbarGroup>
                <ToolbarSeparator />
                <ToolbarGroup aria-label="Lists">
                    <ToolbarButton
                        aria-label="Bulleted list"
                        selected={listType === "bulleted"}
                        onSelectedChange={(selected) => setListType(selected ? "bulleted" : null)}
                    >
                        <Icon name="list" />
                    </ToolbarButton>
                    <ToolbarButton
                        aria-label="Numbered list"
                        selected={listType === "numbered"}
                        onSelectedChange={(selected) => setListType(selected ? "numbered" : null)}
                    >
                        <Icon name="list-ordered" />
                    </ToolbarButton>
                </ToolbarGroup>
                <ToolbarSeparator />
                <ToolbarButton aria-label="Undo" keyboardShortcut="mod+z" onClick={fn()}>
                    <Icon name="history" />
                </ToolbarButton>
            </Toolbar>
        );
    },
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
