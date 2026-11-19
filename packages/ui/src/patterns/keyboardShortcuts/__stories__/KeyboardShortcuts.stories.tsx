import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";

import { Button } from "../../../components/button/Button";
import { Dialog } from "../../../components/dialog/Dialog";
import { KeyboardShortcut } from "../../../components/keyboardShortcut/KeyboardShortcut";
import { useKeyboardShortcut } from "../../../components/keyboardShortcut/useKeyboardShortcut";
import { KeyboardShortcutList, type KeyboardShortcutListItem } from "../../../components/keyboardShortcutList/KeyboardShortcutList";
import { PatternKeyboardShortcuts, PatternPage, PatternRules, PatternSection } from "../../../storybook/patterns/PatternPage";
import { themeDecorator } from "../../../storybook/themeDecorator";
import styles from "./KeyboardShortcuts.stories.module.scss";

const everywhere: KeyboardShortcutListItem[] = [
    { keyboardShortcut: "mod+k", description: "Command palette" },
    { keyboardShortcut: "mod+\\", description: "Collapse or expand the navigation" },
    { keyboardShortcut: "/", description: "Search the list" },
    { keyboardShortcut: "?", description: "Show keyboard shortcuts" },
    { keyboardShortcut: "Escape", description: "Close, clear the selection" },
];

const editing: KeyboardShortcutListItem[] = [
    { keyboardShortcut: "mod+s", description: "Save" },
    { keyboardShortcut: "mod+p", description: "Preview" },
    { keyboardShortcut: "mod+d", description: "Duplicate" },
];

const pageTree: KeyboardShortcutListItem[] = [
    { keyboardShortcut: ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"], description: "Move, expand and collapse" },
    { keyboardShortcut: "Enter", description: "Edit" },
    { keyboardShortcut: "Space", description: "Select" },
];

const finder: KeyboardShortcutListItem[] = [
    { keyboardShortcut: ["mod+1", "mod+2", "mod+3", "mod+4"], description: "Icons, list, columns, gallery" },
    { keyboardShortcut: ["mod+[", "mod+]"], description: "Back, forward" },
    { keyboardShortcut: "mod+ArrowUp", description: "Parent folder" },
    { keyboardShortcut: ["mod+ArrowDown", "mod+o"], description: "Open" },
    { keyboardShortcut: "Enter", description: "Rename" },
    { keyboardShortcut: "Space", description: "Quick look" },
    { keyboardShortcut: "mod+a", description: "Select all" },
    { keyboardShortcut: "mod+d", description: "Duplicate" },
    { keyboardShortcut: "shift+mod+n", description: "New folder" },
    { keyboardShortcut: "mod+Backspace", description: "Delete" },
];

const rules = {
    dos: ["Use the operating system's shortcut where one exists.", "Show shortcuts only in overlays: tooltips, menus, and the command palette."],
    donts: [
        "Shortcuts that override browser shortcuts (except ⌘S and ⌘K).",
        "Single letters as shortcuts while typing in a field.",
        "Key caps on the page itself: in its content, the top bar, search and filter fields, or toolbars.",
    ],
};

function KeyboardShortcutsPage() {
    return (
        <PatternPage>
            <PatternKeyboardShortcuts title="Everywhere" keyboardShortcuts={everywhere} />
            <PatternKeyboardShortcuts title="Editing" keyboardShortcuts={editing} />
            <PatternKeyboardShortcuts title="Page tree" keyboardShortcuts={pageTree} />
            <PatternKeyboardShortcuts title="Finder" keyboardShortcuts={finder} />
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
                <KeyboardShortcutList keyboardShortcuts={[...everywhere, ...editing]} />
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
                    "All keyboard shortcuts in one place. Build them with `useKeyboardShortcut`, show them with `KeyboardShortcutList`, and name them in tooltips (`Tooltip`'s `keyboardShortcut`) and menus, all in the same notation, e.g. `mod+s`: `mod` is ⌘ on Apple platforms and Ctrl elsewhere.",
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
 * - Do: use the operating system's shortcut where one exists; show shortcuts only in overlays: tooltips, menus, and the command palette.
 * - Don't: override browser shortcuts (except ⌘S and ⌘K); use single letters as shortcuts while typing in a field; show key caps on the
 *   page itself: in its content, the top bar, search and filter fields, or toolbars.
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
