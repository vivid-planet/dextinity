import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";

import { Button } from "../../../components/button/Button";
import { ConfirmDialog } from "../../../components/confirmDialog/ConfirmDialog";
import { Icon } from "../../../components/icon/Icon";
import { StatusIndicator } from "../../../components/statusIndicator/StatusIndicator";
import { ToastViewport } from "../../../components/toast/ToastViewport";
import { useToasts } from "../../../components/toast/useToasts";
import { useUndoToast } from "../../../components/undoToast/useUndoToast";
import { PatternExample, PatternPage, PatternRules, PatternSection, PatternSteps, PatternUses } from "../../../storybook/patterns/PatternPage";
import { themeDecorator } from "../../../storybook/themeDecorator";
import styles from "./UndoInsteadOfConfirm.stories.module.scss";

function UndoExample() {
    const [archived, setArchived] = useState(false);
    const [deleted, setDeleted] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const { toasts, add, dismiss } = useToasts();
    const { perform, block } = useUndoToast({ addToast: add });

    return (
        <PatternExample>
            <div className={styles.actions}>
                <StatusIndicator status={archived ? "archived" : "published"} />
                {archived ? (
                    <Button
                        variant="outlined"
                        color="error"
                        startIcon={<Icon name="delete" />}
                        disabled={deleted}
                        onClick={() => setDeleteDialogOpen(true)}
                    >
                        Delete “Benefits” permanently
                    </Button>
                ) : (
                    <Button
                        variant="outlined"
                        color="secondary"
                        startIcon={<Icon name="archive" />}
                        onClick={() =>
                            perform({
                                run: () => setArchived(true),
                                undo: () => setArchived(false),
                                message: "“Benefits” archived",
                                icon: <Icon name="archive" />,
                                undoneMessage: "“Benefits” restored",
                                undoneIcon: <Icon name="reload" />,
                            })
                        }
                    >
                        Archive “Benefits”
                    </Button>
                )}
                <Button
                    variant="outlined"
                    color="error"
                    startIcon={<Icon name="delete" />}
                    onClick={() => block("“logo.svg” is still in use · nothing deleted")}
                >
                    Delete “logo.svg”
                </Button>
            </div>
            <ConfirmDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                tone="danger"
                title="Delete “Benefits” permanently?"
                description="The page and its content are gone for good. This can't be undone."
                confirmLabel="Delete permanently"
                confirmIcon={<Icon name="delete" />}
                onConfirm={() => {
                    setDeleted(true);
                    setDeleteDialogOpen(false);
                    add({ message: "“Benefits” deleted permanently" });
                }}
            />
            <ToastViewport toasts={toasts} onDismiss={dismiss} />
        </PatternExample>
    );
}

function UndoPage() {
    return (
        <PatternPage>
            <PatternSection title="Example" description="Live: archives a demo page, with Undo in the toast.">
                <UndoExample />
            </PatternSection>
            <PatternSteps
                steps={[
                    { title: "Run at once", description: "No question for actions that can be undone." },
                    { title: "Toast with Undo", description: "8 seconds, with the result and count." },
                    { title: "Block instead of asking", description: "When something can't be done, say why: “still in use · nothing deleted”." },
                    { title: "Ask only before loss", description: "Unsaved changes, deleting permanently." },
                ]}
            />
            <PatternUses pages={["Menus & messages", "Modals & overlays"]} />
            <PatternRules
                dos={["The toast says what happened, not what will happen.", "Undo restores exactly the previous state."]}
                donts={["“Are you sure?”", "Undo that only partly works."]}
            />
        </PatternPage>
    );
}

const meta = {
    title: "Patterns/Undo instead of confirm",
    decorators: [themeDecorator],
    parameters: {
        docs: {
            description: {
                component:
                    "Let people act first, then offer Undo. `useUndoToast` runs the action and shows the toast; `ConfirmDialog` is kept for actions that lose data for good.",
            },
        },
    },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * **Rules**
 *
 * - Do: say in the toast what happened, not what will happen; let Undo restore exactly the previous state.
 * - Don't: ask "Are you sure?"; offer an Undo that only partly works.
 */
export const Default: Story = {
    render: () => <UndoPage />,
};

/**
 * Archiving runs at once; Undo in the toast restores the page.
 */
export const ArchiveAndUndo: Story = {
    render: () => <UndoPage />,
    play: async ({ canvas }) => {
        await userEvent.click(canvas.getByRole("button", { name: "Archive “Benefits”" }));
        await expect(canvas.getByText("Archived")).toBeVisible();
        await waitFor(() => expect(canvas.getByText("“Benefits” archived")).toBeVisible());
        await userEvent.click(canvas.getByRole("button", { name: "Undo" }));
        await expect(canvas.getByText("Published")).toBeVisible();
    },
};

/**
 * An action that can't run says why, and nothing changes.
 */
export const Blocked: Story = {
    render: () => <UndoPage />,
    play: async ({ canvas }) => {
        await userEvent.click(canvas.getByRole("button", { name: "Delete “logo.svg”" }));
        await waitFor(() => expect(canvas.getByRole("alert")).toHaveTextContent("“logo.svg” is still in use · nothing deleted"));
    },
};

/**
 * Only an action that loses data for good asks first.
 */
export const AskOnlyBeforeLoss: Story = {
    render: () => <UndoPage />,
    play: async ({ canvas, canvasElement }) => {
        await userEvent.click(canvas.getByRole("button", { name: "Archive “Benefits”" }));
        await userEvent.click(canvas.getByRole("button", { name: "Delete “Benefits” permanently" }));
        const dialog = await within(canvasElement.ownerDocument.body).findByRole("alertdialog", { name: "Delete “Benefits” permanently?" });
        await userEvent.click(within(dialog).getByRole("button", { name: "Delete permanently" }));
        await waitFor(() => expect(canvas.getByText("“Benefits” deleted permanently")).toBeVisible());
    },
};
