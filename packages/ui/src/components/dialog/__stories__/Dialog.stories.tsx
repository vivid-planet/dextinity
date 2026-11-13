import type { Meta, StoryObj } from "@storybook/react-vite";
import { type FormEvent, useId, useRef, useState } from "react";
import { expect, fn, screen, userEvent, waitFor } from "storybook/test";

import { themeDecorator } from "../../../storybook/themeDecorator";
import { Button } from "../../button/Button";
import { Field } from "../../field/Field";
import { Input } from "../../input/Input";
import { Dialog, type DialogProps } from "../Dialog";
import dialogTokens from "../Dialog.tokens.scss?raw";
import { DialogFormActions } from "../DialogFormActions";
import styles from "./Dialog.stories.module.scss";

function ControlledDialog(props: DialogProps) {
    const [open, setOpen] = useState(props.open);
    const handleOpenChange = (nextOpen: boolean) => {
        setOpen(nextOpen);
        props.onOpenChange(nextOpen);
    };
    return (
        <>
            <Button variant="outlined" color="secondary" onClick={() => handleOpenChange(true)}>
                Open dialog
            </Button>
            <Dialog {...props} open={open} onOpenChange={handleOpenChange} />
        </>
    );
}

const meta = {
    component: Dialog,
    title: "Building blocks/Modals & overlays/Dialog",
    decorators: [themeDecorator],
    parameters: { tokens: dialogTokens, closedOnDocsPage: true },
    render: (args) => <ControlledDialog key={String(args.open)} {...args} />,
    args: {
        open: false,
        onOpenChange: fn(),
        title: "Unsaved changes",
        description: "If you save, they go live right away.",
        footer: (
            <>
                <Button variant="text">Cancel</Button>
                <Button>Save and continue</Button>
            </>
        ),
    },
    argTypes: {
        size: {
            control: "radio",
            options: ["small", "default", "large"],
        },
        role: {
            control: "radio",
            options: ["dialog", "alertdialog"],
        },
        children: { control: false },
        footer: { control: false },
        initialFocus: { control: false },
        dismissible: { control: "boolean" },
        labels: { control: false },
        className: { control: false },
        slotProps: { control: false },
    },
} satisfies Meta<typeof Dialog>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * Opens over a dimmed page. Focus moves into the dialog and stays there; Escape, the close button, or a click on the
 * backdrop close it, and focus returns to the trigger.
 *
 * **Rules**
 *
 * - Only when something would be lost otherwise, or the task needs full attention.
 * - Secondary actions first, the primary action last.
 * - No dialog over a dialog.
 * - No forms with more than six fields in a dialog: use a `Drawer` or a page.
 * - Prefer a `Drawer` when people need the context behind it.
 */
export const Default: Story = {
    play: async ({ args, canvas }) => {
        const trigger = canvas.getByRole("button", { name: "Open dialog" });
        await userEvent.click(trigger);
        const dialog = await screen.findByRole("dialog", { name: "Unsaved changes" });
        await waitFor(() => expect(dialog).toHaveAccessibleDescription("If you save, they go live right away."));
        await waitFor(() => expect(dialog.contains(document.activeElement)).toBe(true));
        const firstFocused = document.activeElement;
        for (let i = 0; i < 5; i++) {
            await userEvent.tab();
            await waitFor(() => expect(dialog.contains(document.activeElement)).toBe(true));
        }
        (firstFocused as HTMLElement).focus();
        await userEvent.keyboard("{Escape}");
        await waitFor(() => expect(args.onOpenChange).toHaveBeenLastCalledWith(false));
        await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
        await waitFor(() => expect(trigger).toHaveFocus());
    },
};

export const Open: Story = {
    args: { open: true },
};

/**
 * The close button in the corner closes the dialog.
 */
export const CloseButton: Story = {
    args: { open: true },
};

function RedirectForm() {
    const [source, setSource] = useState("/alt-2");
    const [target, setTarget] = useState("/careers");
    return (
        <>
            <Field label="Source">
                <Input name="source" value={source} onChange={(event) => setSource(event.target.value)} />
            </Field>
            <Field label="Target">
                <Input name="target" value={target} onChange={(event) => setTarget(event.target.value)} />
            </Field>
        </>
    );
}

/**
 * A short form in the dialog's content.
 */
export const WithForm: Story = {
    args: {
        open: true,
        title: "New redirect",
        description: undefined,
        children: <RedirectForm />,
        footer: (
            <>
                <Button variant="text">Cancel</Button>
                <Button>Create</Button>
            </>
        ),
    },
};

/**
 * `small` (440 px) for questions.
 */
export const Small: Story = {
    args: { open: true, size: "small" },
};

/**
 * `large` (960 px) for content that needs room, e.g. a comparison.
 */
export const Large: Story = {
    args: { open: true, size: "large" },
};

function BrightPage() {
    return (
        <div className={styles.brightPage}>
            <h2>Site preview</h2>
            <p>A bright page, e.g. a site preview, stays behind the dialog in every color scheme.</p>
        </div>
    );
}

/**
 * Over a bright page, e.g. the site preview, the dialog surface stays nearly opaque in dark mode, so the page doesn't shine
 * through and the content stays readable.
 */
export const OverBrightPage: Story = {
    args: { open: true, title: "Choose a page", description: "The page the link points to." },
    render: (args) => (
        <>
            <BrightPage />
            <ControlledDialog key={String(args.open)} {...args} />
        </>
    ),
};

/**
 * Without the close button, only Escape and the footer's actions close the dialog.
 */
export const HideCloseButton: Story = {
    args: { open: true, hideCloseButton: true },
};

function InitialFocusDialog(props: DialogProps) {
    const saveRef = useRef<HTMLButtonElement>(null);
    return (
        <ControlledDialog
            {...props}
            initialFocus={saveRef}
            footer={
                <>
                    <Button variant="text">Cancel</Button>
                    <Button ref={saveRef}>Save and continue</Button>
                </>
            }
        />
    );
}

/**
 * `initialFocus` focuses a given element on open instead of the first focusable one.
 */
export const InitialFocus: Story = {
    args: { open: true },
    render: (args) => <InitialFocusDialog key={String(args.open)} {...args} />,
};

/**
 * `role="alertdialog"` doesn't close on a click on the backdrop. Prefer `ConfirmDialog` for questions.
 */
export const AlertDialog: Story = {
    args: { open: true, role: "alertdialog" },
};

/**
 * `dismissible={false}` keeps Escape, the backdrop, and the close button from closing the dialog, e.g. while it saves.
 */
export const NotDismissible: Story = {
    args: { open: true, dismissible: false },
};

/** A dialog with a form: the form element is in the content, the footer's submit button submits it by its id. */
function FormDialog(props: DialogProps) {
    const formId = useId();
    const [open, setOpen] = useState(props.open);
    const [name, setName] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const close = () => {
        setOpen(false);
        props.onOpenChange(false);
    };
    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setSubmitting(true);
        setTimeout(() => {
            setSubmitting(false);
            close();
        }, 800);
    };

    return (
        <>
            <Button variant="outlined" color="secondary" onClick={() => setOpen(true)}>
                New folder
            </Button>
            <Dialog
                {...props}
                open={open}
                onOpenChange={(nextOpen) => (nextOpen ? setOpen(true) : close())}
                dismissible={!submitting}
                footer={
                    <DialogFormActions formId={formId} submitLabel="Create" onCancel={close} submitting={submitting} submitDisabled={name === ""} />
                }
            >
                <form id={formId} onSubmit={handleSubmit}>
                    <Field label="Name" required>
                        <Input name="name" value={name} onChange={(event) => setName(event.target.value)} />
                    </Field>
                </form>
            </Dialog>
        </>
    );
}

/**
 * `DialogFormActions` fills the footer of a dialog with a form: Cancel and a submit button wired to the form's `id`. While the form
 * submits, the buttons are disabled; turn `dismissible` off meanwhile.
 */
export const WithFormActions: Story = {
    args: { open: true, title: "New folder", description: undefined, footer: undefined },
    render: (args) => <FormDialog {...args} />,
};
