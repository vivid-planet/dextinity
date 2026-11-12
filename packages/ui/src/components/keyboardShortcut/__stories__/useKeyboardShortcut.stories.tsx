import type { Meta, StoryObj } from "@storybook/react-vite";
import { useRef, useState } from "react";
import { expect, userEvent, waitFor } from "storybook/test";

import { themeDecorator } from "../../../storybook/themeDecorator";
import { Icon } from "../../icon/Icon";
import { SaveState, type SaveStateValue } from "../../saveState/SaveState";
import { TextField } from "../../textField/TextField";
import { KeyboardShortcut } from "../KeyboardShortcut";
import { formatShortcut, isApplePlatform, useKeyboardShortcut } from "../useKeyboardShortcut";
import styles from "./useKeyboardShortcut.stories.module.scss";

function SaveShortcutDemo() {
    const [title, setTitle] = useState("Careers");
    const [saveState, setSaveState] = useState<SaveStateValue>("saved");
    useKeyboardShortcut("mod+s", () => setSaveState("saved"));

    return (
        <div className={styles.demo}>
            <TextField
                label="Title"
                name="title"
                value={title}
                onChange={(event) => {
                    setTitle(event.target.value);
                    setSaveState("dirty");
                }}
            />
            <div className={styles.row}>
                <SaveState state={saveState} />
                <span className={styles.keys}>
                    {formatShortcut("mod+s").map((key) => (
                        <KeyboardShortcut key={key}>{key}</KeyboardShortcut>
                    ))}
                </span>
            </div>
        </div>
    );
}

function SearchShortcutDemo() {
    const [query, setQuery] = useState("");
    const searchRef = useRef<HTMLInputElement>(null);
    useKeyboardShortcut("/", () => searchRef.current?.focus());

    return (
        <div className={styles.demo}>
            <TextField
                ref={searchRef}
                label="Search"
                name="search"
                type="search"
                prefix={<Icon name="search" />}
                suffix={<KeyboardShortcut>/</KeyboardShortcut>}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
            />
        </div>
    );
}

const meta = {
    title: "Patterns/Keyboard shortcuts/useKeyboardShortcut",
    decorators: [themeDecorator],
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

const modKey = isApplePlatform() ? "Meta" : "Control";

/**
 * `useKeyboardShortcut("mod+s", save)` saves from anywhere, also while typing in a field; `mod` is ⌘ on Apple platforms and Ctrl
 * elsewhere, and `formatShortcut` gives the matching key caps.
 *
 * **Rules**
 *
 * - Use the operating system's shortcut where one exists.
 * - Don't override browser shortcuts, except ⌘S and ⌘K.
 */
export const Default: Story = {
    render: () => <SaveShortcutDemo />,
    play: async ({ canvas }) => {
        await userEvent.type(canvas.getByRole("textbox", { name: "Title" }), "!");
        await expect(canvas.getByText("Unsaved changes")).toBeVisible();
        await userEvent.keyboard(`{${modKey}>}s{/${modKey}}`);
        await waitFor(() => expect(canvas.queryByText("Unsaved changes")).toBeNull());
    },
};

/**
 * A shortcut without a modifier, such as `/` to jump into the list's search, never fires while typing in a field, so the
 * character is typed instead.
 */
export const SingleKey: Story = {
    render: () => <SearchShortcutDemo />,
    play: async ({ canvas }) => {
        const search = canvas.getByRole("searchbox", { name: "Search" });
        await userEvent.keyboard("/");
        await expect(search).toHaveFocus();
        await userEvent.keyboard("/");
        await expect(search).toHaveValue("/");
    },
};
