import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";

import { Button } from "../../../components/button/Button";
import { Dialog } from "../../../components/dialog/Dialog";
import { KeyboardShortcut } from "../../../components/keyboardShortcut/KeyboardShortcut";
import { useKeyboardShortcut } from "../../../components/keyboardShortcut/useKeyboardShortcut";
import { ShortcutList, type ShortcutListItem } from "../../../components/shortcutList/ShortcutList";
import { PatternPage, PatternRules, PatternSection, PatternShortcuts } from "../../../storybook/patterns/PatternPage";
import { themeDecorator } from "../../../storybook/themeDecorator";
import styles from "./KeyboardShortcuts.stories.module.scss";

const everywhere: ShortcutListItem[] = [
    { shortcut: "mod+k", description: "Command palette" },
    { shortcut: "mod+\\", description: "Collapse or expand the navigation" },
    { shortcut: "/", description: "Search the list" },
    { shortcut: "?", description: "Show keyboard shortcuts" },
    { shortcut: "Escape", description: "Close, clear the selection" },
];

const editing: ShortcutListItem[] = [
    { shortcut: "mod+s", description: "Save" },
    { shortcut: "mod+p", description: "Preview" },
    { shortcut: "mod+d", description: "Duplicate" },
];

const pageTree: ShortcutListItem[] = [
    { shortcut: ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"], description: "Move, expand and collapse" },
    { shortcut: "Enter", description: "Edit" },
    { shortcut: "Space", description: "Select" },
];

const finder: ShortcutListItem[] = [
    { shortcut: ["mod+1", "mod+2", "mod+3", "mod+4"], description: "Icons, list, columns, gallery" },
    { shortcut: ["mod+[", "mod+]"], description: "Back, forward" },
    { shortcut: "mod+ArrowUp", description: "Parent folder" },
    { shortcut: ["mod+ArrowDown", "mod+o"], description: "Open" },
    { shortcut: "Enter", description: "Rename" },
    { shortcut: "Space", description: "Quick look" },
    { shortcut: "mod+a", description: "Select all" },
    { shortcut: "mod+d", description: "Duplicate" },
    { shortcut: "shift+mod+n", description: "New folder" },
    { shortcut: "mod+Backspace", description: "Delete" },
];

const rules = {
    dos: ["Use the operating system's shortcut where one exists.", "Show shortcuts in tooltips and menus."],
    donts: ["Shortcuts that override browser shortcuts (except ⌘S and ⌘K).", "Single letters as shortcuts while typing in a field."],
};

function KeyboardShortcutsPage() {
    return (
        <PatternPage>
            <PatternShortcuts title="Everywhere" shortcuts={everywhere} />
            <PatternShortcuts title="Editing" shortcuts={editing} />
            <PatternShortcuts title="Page tree" shortcuts={pageTree} />
            <PatternShortcuts title="Finder" shortcuts={finder} />
            <PatternRules {...rules} />
        </PatternPage>
    );
}

function ShortcutOverview() {
    const [open, setOpen] = useState(false);
    useKeyboardShortcut("?", () => setOpen(true));

    return (
        <PatternPage>
            <PatternSection title="Example" description="Live: press ? anywhere outside a text field to see every shortcut.">
                <div className={styles.hint}>
                    <KeyboardShortcut shortcut="?" />
                    <span>Show keyboard shortcuts</span>
                    <Button variant="outlined" color="secondary" size="small" onClick={() => setOpen(true)}>
                        Show shortcuts
                    </Button>
                </div>
            </PatternSection>
            <Dialog open={open} onOpenChange={setOpen} title="Keyboard shortcuts" size="large">
                <ShortcutList shortcuts={[...everywhere, ...editing]} />
            </Dialog>
        </PatternPage>
    );
}

const meta = {
    title: "Patterns/Keyboard shortcuts",
    decorators: [themeDecorator],
    parameters: {
        docs: {
            description: {
                component:
                    "All keyboard shortcuts in one place. Build them with `useKeyboardShortcut`, show them with `ShortcutList`, and name them in tooltips (`Tooltip`'s `shortcut`) and menus, all in the same notation, e.g. `mod+s`: `mod` is ⌘ on Apple platforms and Ctrl elsewhere.",
            },
        },
    },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * Every shortcut of the admin, grouped by where it works.
 *
 * **Rules**
 *
 * - Do: use the operating system's shortcut where one exists; show shortcuts in tooltips and menus.
 * - Don't: override browser shortcuts (except ⌘S and ⌘K); use single letters as shortcuts while typing in a field.
 */
export const Default: Story = {
    render: () => <KeyboardShortcutsPage />,
    play: async ({ canvas }) => {
        await expect(canvas.getByRole("heading", { name: "Everywhere" })).toBeVisible();
        await expect(canvas.getByRole("cell", { name: "Command palette" })).toBeVisible();
    },
};

/**
 * `?` opens the overview of all shortcuts in a dialog; `Esc` closes it.
 */
export const ShortcutOverviewDialog: Story = {
    render: () => <ShortcutOverview />,
    play: async ({ canvasElement }) => {
        const body = within(canvasElement.ownerDocument.body);
        await userEvent.keyboard("?");
        const dialog = await body.findByRole("dialog", { name: "Keyboard shortcuts" });
        await waitFor(() => expect(within(dialog).getByRole("cell", { name: "Save" })).toBeVisible());
        await userEvent.click(within(dialog).getByRole("cell", { name: "Save" }));
        await userEvent.keyboard("{Escape}");
        await waitFor(() => expect(body.queryByRole("dialog")).toBeNull());
    },
};
