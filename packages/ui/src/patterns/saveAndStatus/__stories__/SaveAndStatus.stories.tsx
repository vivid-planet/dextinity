import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";

import { Button } from "../../../components/button/Button";
import { ConfirmDialog } from "../../../components/confirmDialog/ConfirmDialog";
import { Field } from "../../../components/field/Field";
import { Icon } from "../../../components/icon/Icon";
import { Input } from "../../../components/input/Input";
import { formatShortcut, isApplePlatform, useKeyboardShortcut } from "../../../components/keyboardShortcut/useKeyboardShortcut";
import { SaveState, type SaveStateValue } from "../../../components/saveState/SaveState";
import { StatusIndicator } from "../../../components/statusIndicator/StatusIndicator";
import { Switch } from "../../../components/switch/Switch";
import { ToastViewport } from "../../../components/toast/ToastViewport";
import { useToasts } from "../../../components/toast/useToasts";
import { Tooltip } from "../../../components/tooltip/Tooltip";
import {
    PatternExample,
    PatternPage,
    PatternRules,
    PatternSection,
    PatternShortcuts,
    PatternSteps,
    PatternUses,
} from "../../../storybook/patterns/PatternPage";
import { themeDecorator } from "../../../storybook/themeDecorator";
import styles from "./SaveAndStatus.stories.module.scss";

function StatusModel() {
    return (
        <div className={styles.flow}>
            <span className={styles.flowNode}>New</span>
            <Icon name="arrow-right" />
            <span className={styles.flowNode}>
                <StatusIndicator status="unpublished" />
            </span>
            <span className={styles.flowSwitch}>
                <Icon name="arrow-right" />
                <span>Switch</span>
                <Icon name="arrow-left" />
            </span>
            <span className={styles.flowNode}>
                <StatusIndicator status="published" />
            </span>
            <Icon name="arrow-right" />
            <span className={styles.flowNode}>
                <StatusIndicator status="archived" />
            </span>
        </div>
    );
}

type PageStatus = "published" | "unpublished" | "archived";

function EditPageExample() {
    const [savedTitle, setSavedTitle] = useState("Benefits");
    const [title, setTitle] = useState("Benefits");
    const [status, setStatus] = useState<PageStatus>("published");
    const [saveState, setSaveState] = useState<SaveStateValue>("saved");
    const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);
    const { toasts, add, dismiss } = useToasts();

    const dirty = title !== savedTitle;
    const save = () => {
        setSavedTitle(title);
        setSaveState("saved");
        add({ message: status === "published" ? "Saved – the change is live" : "Saved" });
    };
    useKeyboardShortcut("mod+s", save, { enabled: status !== "archived" });

    const archive = () => {
        const previousStatus = status;
        setStatus("archived");
        add({
            message: `“${savedTitle}” archived`,
            icon: <Icon name="archive" />,
            action: { label: "Undo", onClick: () => setStatus(previousStatus) },
        });
    };

    return (
        <PatternExample>
            <div className={styles.editor}>
                <div className={styles.toolbar}>
                    <StatusIndicator status={status} />
                    <SaveState state={dirty ? "dirty" : saveState} />
                    <span className={styles.spacer} />
                    {status === "archived" ? (
                        <Button
                            variant="outlined"
                            color="secondary"
                            size="small"
                            startIcon={<Icon name="reload" />}
                            onClick={() => setStatus("unpublished")}
                        >
                            Restore
                        </Button>
                    ) : (
                        <>
                            <Switch checked={status === "published"} onChange={(checked) => setStatus(checked ? "published" : "unpublished")}>
                                Published
                            </Switch>
                            <Button variant="outlined" color="secondary" size="small" startIcon={<Icon name="archive" />} onClick={archive}>
                                Archive
                            </Button>
                            <Button variant="outlined" color="secondary" size="small" onClick={() => (dirty ? setLeaveDialogOpen(true) : undefined)}>
                                Leave
                            </Button>
                            <Tooltip
                                content={status === "published" ? "The page is published: saving makes the change live" : "Saves without publishing"}
                                shortcut={formatShortcut("mod+s").join("")}
                            >
                                <Button size="small" onClick={save}>
                                    Save
                                </Button>
                            </Tooltip>
                        </>
                    )}
                </div>
                <Field label="Title" disabled={status === "archived"}>
                    <Input
                        name="title"
                        value={title}
                        onChange={(event) => {
                            setTitle(event.target.value);
                            setSaveState("dirty");
                        }}
                    />
                </Field>
            </div>
            <ConfirmDialog
                open={leaveDialogOpen}
                onOpenChange={setLeaveDialogOpen}
                title="Unsaved changes"
                description={status === "published" ? "If you save, they go live right away." : "Save them before you leave?"}
                secondaryLabel="Discard"
                onSecondary={() => {
                    setTitle(savedTitle);
                    setLeaveDialogOpen(false);
                }}
                confirmLabel="Save and continue"
                onConfirm={() => {
                    save();
                    setLeaveDialogOpen(false);
                }}
            />
            <ToastViewport toasts={toasts} onDismiss={dismiss} />
        </PatternExample>
    );
}

function SaveAndStatusPage() {
    return (
        <PatternPage>
            <PatternSection title="Status model" description="Only three states. No draft, no versions, no scheduling.">
                <StatusModel />
            </PatternSection>
            <PatternSection
                title="Example"
                description="Live: edit the title, save with the button or the shortcut, publish with the switch, archive and restore."
            >
                <EditPageExample />
            </PatternSection>
            <PatternSteps
                steps={[
                    { title: "Edit", description: "The header shows “Unsaved changes”." },
                    {
                        title: `Save (${formatShortcut("mod+s").join(isApplePlatform() ? "" : "+")})`,
                        description: "If the page is published, the change is live right away. The button's tooltip says so.",
                    },
                    { title: "Publish", description: "The “Published” switch – also in list, tree and detail." },
                    { title: "Leaving with changes", description: "Ask: Cancel, Discard, Save and continue." },
                    { title: "Archive", description: "Off the website, stays in the admin. Restoring sets it to Unpublished." },
                ]}
            />
            <PatternShortcuts shortcuts={[{ keys: formatShortcut("mod+s"), description: "Save" }]} />
            <PatternUses pages={["Buttons", "Selection & toggles", "Status, tags & badges", "Loading & save state", "Modals & overlays"]} />
            <PatternRules
                dos={[
                    "Always the same status words: Published, Unpublished, Archived.",
                    "Newly created is always unpublished.",
                    "Block visibility is not a status.",
                ]}
                donts={["“Draft”, “Go live”, “Release”.", "A global “Publish everything”."]}
            />
        </PatternPage>
    );
}

const meta = {
    title: "Patterns/Save & status",
    decorators: [themeDecorator],
    parameters: {
        docs: {
            description: {
                component:
                    "Published, unpublished, archived – and what saving means. `StatusIndicator` shows the status, `Switch` publishes, `SaveState` shows unsaved changes, `ConfirmDialog` asks before changes are lost.",
            },
        },
    },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

const modKey = isApplePlatform() ? "Meta" : "Control";

/**
 * **Rules**
 *
 * - Do: always use the same status words (Published, Unpublished, Archived); create items unpublished; don't treat block
 *   visibility as a status.
 * - Don't: say "Draft", "Go live" or "Release"; offer a global "Publish everything".
 */
export const Default: Story = {
    render: () => <SaveAndStatusPage />,
};

/**
 * Editing shows "Unsaved changes"; the save shortcut saves even while typing, and the toast says the change is live.
 */
export const SaveWithShortcut: Story = {
    render: () => <SaveAndStatusPage />,
    play: async ({ canvas }) => {
        await userEvent.type(canvas.getByRole("textbox", { name: "Title" }), " & perks");
        await expect(canvas.getByText("Unsaved changes")).toBeVisible();
        await userEvent.keyboard(`{${modKey}>}s{/${modKey}}`);
        await waitFor(() => expect(canvas.getByText("Saved – the change is live")).toBeVisible());
        await expect(canvas.getByText("All changes saved")).toBeVisible();
    },
};

/**
 * Leaving with unsaved changes asks: Cancel, Discard, or Save and continue.
 */
export const LeaveWithChanges: Story = {
    render: () => <SaveAndStatusPage />,
    play: async ({ canvas, canvasElement }) => {
        await userEvent.type(canvas.getByRole("textbox", { name: "Title" }), "!");
        await userEvent.click(canvas.getByRole("button", { name: "Leave" }));
        const dialog = await within(canvasElement.ownerDocument.body).findByRole("alertdialog", { name: "Unsaved changes" });
        await userEvent.click(within(dialog).getByRole("button", { name: "Discard" }));
        await waitFor(() => expect(canvas.getByRole("textbox", { name: "Title" })).toHaveValue("Benefits"));
    },
};

/**
 * Archiving takes the page off the website at once, with Undo; restoring sets it to Unpublished.
 */
export const ArchiveAndRestore: Story = {
    render: () => <SaveAndStatusPage />,
    play: async ({ canvas }) => {
        await userEvent.click(canvas.getByRole("button", { name: "Archive" }));
        await waitFor(() => expect(canvas.getByText("“Benefits” archived")).toBeVisible());
        await userEvent.click(canvas.getByRole("button", { name: "Restore" }));
        await expect(canvas.getByRole("switch", { name: "Published" })).not.toBeChecked();
    },
};
