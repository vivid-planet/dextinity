import type { Meta, StoryObj } from "@storybook/react-vite";
import { useEffect, useState } from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";

import { themeDecorator } from "../../../storybook/themeDecorator";
import { Button } from "../../button/Button";
import { SaveState, type SaveStateValue } from "../SaveState";
import saveStateTokens from "../SaveState.tokens.scss?raw";
import styles from "./SaveState.stories.module.scss";

const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);

const meta = {
    component: SaveState,
    title: "Building blocks/Loading & save state/SaveState",
    decorators: [themeDecorator],
    parameters: { tokens: saveStateTokens },
    args: {
        state: "saved",
        savedAt: twoMinutesAgo,
    },
    argTypes: {
        state: { control: "radio", options: ["saved", "dirty", "saving", "error"] },
        savedAt: { control: "date" },
        labels: { control: false },
        className: { control: false },
        slotProps: { control: false },
    },
} satisfies Meta<typeof SaveState>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * Everything is saved. Hover or focus shows when.
 *
 * **Rules**
 *
 * - Stay quiet while everything is saved; only unsaved changes and errors stand out.
 * - Show "Saving …" only for saves that take longer than 300 ms.
 */
export const Default: Story = {
    play: async ({ canvas, canvasElement }) => {
        await userEvent.tab();
        await expect(canvas.getByRole("status")).toHaveFocus();
        const body = within(canvasElement.ownerDocument.body);
        await waitFor(() => expect(body.getByRole("tooltip")).toHaveTextContent("Saved 2 minutes ago"));
    },
};

/**
 * All states side by side.
 */
export const States: Story = {
    render: (args) => (
        <div className={styles.states}>
            {(["saved", "dirty", "saving", "error"] as const).map((state) => (
                <SaveState key={state} {...args} state={state} />
            ))}
        </div>
    ),
};

function EditorExample() {
    const [state, setState] = useState<SaveStateValue>("saved");
    const [savedAt, setSavedAt] = useState(twoMinutesAgo);

    useEffect(() => {
        if (state !== "saving") {
            return;
        }
        const timeout = window.setTimeout(() => {
            setState("saved");
            setSavedAt(new Date());
        }, 800);
        return () => window.clearTimeout(timeout);
    }, [state]);

    return (
        <div className={styles.toolbar}>
            <SaveState state={state} savedAt={savedAt} />
            <Button variant="outlined" size="small" onClick={() => setState("dirty")}>
                Edit
            </Button>
            <Button size="small" disabled={state !== "dirty"} onClick={() => setState("saving")}>
                Save
            </Button>
        </div>
    );
}

/**
 * In the page header of an edit page: editing marks unsaved changes, saving moves through "Saving …" back to saved.
 */
export const InEditor: Story = {
    render: () => <EditorExample />,
    play: async ({ canvas }) => {
        await userEvent.click(canvas.getByRole("button", { name: "Edit" }));
        await expect(canvas.getByRole("status")).toHaveTextContent("Unsaved changes");
        await userEvent.click(canvas.getByRole("button", { name: "Save" }));
        await expect(canvas.getByRole("status")).toHaveTextContent("Saving …");
        await waitFor(() => expect(canvas.getByRole("status")).toHaveTextContent("All changes saved"), { timeout: 2000 });
    },
};
