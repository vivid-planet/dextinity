import type { Meta, StoryObj } from "@storybook/react-vite";
import { useRef, useState } from "react";
import { expect, userEvent, waitFor } from "storybook/test";

import { storyModKey } from "../../../storybook/keyboardPlatformDecorator";
import { themeDecorator } from "../../../storybook/themeDecorator";
import { Field } from "../../field/Field";
import { Icon } from "../../icon/Icon";
import { Input } from "../../input/Input";
import { SaveState, type SaveStateValue } from "../../saveState/SaveState";
import { KeyboardShortcut } from "../KeyboardShortcut";
import { useKeyboardShortcut } from "../useKeyboardShortcut";
import styles from "./useKeyboardShortcut.stories.module.scss";

function SaveShortcutDemo() {
    const [title, setTitle] = useState("Careers");
    const [saveState, setSaveState] = useState<SaveStateValue>("saved");
    useKeyboardShortcut("mod+s", () => setSaveState("saved"));

    return (
        <div className={styles.demo}>
            <Field label="Title">
                <Input
                    name="title"
                    value={title}
                    onChange={(event) => {
                        setTitle(event.target.value);
                        setSaveState("dirty");
                    }}
                />
            </Field>
            <div className={styles.row}>
                <SaveState state={saveState} />
                <KeyboardShortcut shortcut="mod+s" />
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
            <Field label="Search" prefix={<Icon name="search" />} suffix={<KeyboardShortcut shortcut="/" />}>
                <Input ref={searchRef} name="search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} />
            </Field>
        </div>
    );
}

const meta = {
    title: "Patterns/Keyboard shortcuts/useKeyboardShortcut",
    decorators: [themeDecorator],
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * `useKeyboardShortcut("mod+s", save)` saves from anywhere, also while typing in a field; `mod` is ⌘ on Apple platforms and Ctrl
 * elsewhere, and `KeyboardShortcut` with the same `shortcut` shows the matching key caps.
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
        await userEvent.keyboard(`{${storyModKey()}>}s{/${storyModKey()}}`);
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
