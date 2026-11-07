import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";

import { Button } from "../../../components/button/Button";
import { Dialog } from "../../../components/dialog/Dialog";
import { Kbd } from "../../../components/kbd/Kbd";
import { formatShortcut, useKeyboardShortcut } from "../../../components/keyboardShortcut/useKeyboardShortcut";
import { ShortcutList, type ShortcutListItem } from "../../../components/shortcutList/ShortcutList";
import { PatternPage, PatternRules, PatternSection, PatternShortcuts } from "../../../storybook/patterns/PatternPage";
import { themeDecorator } from "../../../storybook/themeDecorator";
import styles from "./Keyboard.stories.module.scss";

const keys = (shortcut: string) => formatShortcut(shortcut);

const everywhere: ShortcutListItem[] = [
    { keys: keys("mod+k"), description: "Command palette" },
    { keys: keys("mod+j"), description: "AI assistant" },
    { keys: keys("mod+\\"), description: "Collapse or expand the navigation" },
    { keys: ["/"], description: "Search the list" },
    { keys: ["?"], description: "Show keyboard shortcuts" },
    { keys: ["Esc"], description: "Close, clear the selection" },
];

const editing: ShortcutListItem[] = [
    { keys: keys("mod+s"), description: "Save" },
    { keys: keys("mod+p"), description: "Preview" },
    { keys: keys("mod+d"), description: "Duplicate" },
];

const pageTree: ShortcutListItem[] = [
    { keys: ["↑", "↓", "←", "→"], description: "Move, expand and collapse" },
    { keys: ["Enter"], description: "Edit" },
    { keys: ["Space"], description: "Select" },
];

const finder: ShortcutListItem[] = [
    { keys: [...keys("mod+1"), "–", "4"], description: "Icons, list, columns, gallery" },
    { keys: [...keys("mod+["), ...keys("mod+]")], description: "Back, forward" },
    { keys: keys("mod+ArrowUp"), description: "Parent folder" },
    { keys: [...keys("mod+ArrowDown"), ...keys("mod+o")], description: "Open" },
    { keys: ["Enter"], description: "Rename" },
    { keys: ["Space"], description: "Quick look" },
    { keys: keys("mod+a"), description: "Select all" },
    { keys: keys("mod+d"), description: "Duplicate" },
    { keys: keys("shift+mod+n"), description: "New folder" },
    { keys: keys("mod+Backspace"), description: "Delete" },
];

const rules = {
    dos: ["Use the operating system's shortcut where one exists.", "Show shortcuts in tooltips and menus."],
    donts: ["Shortcuts that override browser shortcuts (except ⌘S and ⌘K).", "Single letters as shortcuts while typing in a field."],
};

function KeyboardPage() {
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
                    <Kbd>?</Kbd>
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
    title: "Patterns/Keyboard",
    decorators: [themeDecorator],
    parameters: {
        docs: {
            description: {
                component:
                    "All keyboard shortcuts in one place. Build them with `useKeyboardShortcut`, show them with `ShortcutList`, and name them in tooltips (`Tooltip`'s `shortcut`) and menus.",
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
    render: () => <KeyboardPage />,
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
