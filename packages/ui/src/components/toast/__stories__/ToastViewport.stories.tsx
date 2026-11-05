import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, waitFor } from "storybook/test";

import { themeDecorator } from "../../../storybook/themeDecorator";
import { Button } from "../../button/Button";
import toastTokens from "../_tokens.scss?raw";
import { ToastViewport, type ToastViewportProps } from "../ToastViewport";
import { type NewToast, useToasts } from "../useToasts";
import styles from "./Toast.stories.module.scss";

const onUndo = fn();

function ToastDemo({ toast, ...props }: ToastViewportProps & { toast: NewToast }) {
    const { toasts, add, dismiss } = useToasts();
    return (
        <div className={styles.demo}>
            <Button onClick={() => add(toast)}>Save</Button>
            <Button variant="outlined" color="secondary" onClick={() => add({ message: "Please enter a title first", tone: "error" })}>
                Publish
            </Button>
            <ToastViewport
                {...props}
                toasts={toasts}
                onDismiss={(id) => {
                    dismiss(id);
                    props.onDismiss(id);
                }}
            />
        </div>
    );
}

const meta = {
    component: ToastViewport,
    title: "Building blocks/Menus & messages/ToastViewport",
    decorators: [themeDecorator],
    parameters: { tokens: toastTokens },
    args: {
        toasts: [],
        onDismiss: fn(),
    },
    argTypes: {
        toasts: { control: false },
        labels: { control: false },
        className: { control: false },
        slotProps: { control: false },
    },
} satisfies Meta<typeof ToastViewport>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * Hold the toasts with `useToasts`: `add` shows a toast in place of the current one and returns its id, `dismiss` removes it.
 *
 * ```tsx
 * const { toasts, add, dismiss } = useToasts();
 * add({ message: "Saved – the change is live", action: { label: "Undo", onClick: undo } });
 * <ToastViewport toasts={toasts} onDismiss={dismiss} />
 * ```
 *
 * A toast dismisses itself after 5 seconds, or 8 with an action; the pointer or focus on it pauses the time.
 */
export const Default: Story = {
    render: (args) => <ToastDemo {...args} toast={{ message: "Saved – the change is live", action: { label: "Undo", onClick: onUndo } }} />,
    play: async ({ args, canvas }) => {
        await userEvent.click(canvas.getByRole("button", { name: "Save" }));
        const region = canvas.getByRole("region", { name: "Notifications" });
        await expect(region).toHaveTextContent("Saved – the change is live");
        await userEvent.click(canvas.getByRole("button", { name: "Undo" }));
        await expect(onUndo).toHaveBeenCalled();
        await expect(args.onDismiss).toHaveBeenCalledWith("toast-1");
        await waitFor(() => expect(canvas.queryByRole("status")).toBeNull());
    },
};

/**
 * A new toast replaces the current one, so only the latest result is shown.
 */
export const ReplacesCurrentToast: Story = {
    render: (args) => <ToastDemo {...args} toast={{ message: "Saved – the change is live" }} />,
    play: async ({ canvas }) => {
        await userEvent.click(canvas.getByRole("button", { name: "Save" }));
        await userEvent.click(canvas.getByRole("button", { name: "Publish" }));
        await expect(canvas.getByRole("alert")).toHaveTextContent("Please enter a title first");
        await expect(canvas.queryByRole("status")).toBeNull();
    },
};

/**
 * `duration` sets how long a toast stays, here half a second.
 */
export const Duration: Story = {
    render: (args) => <ToastDemo {...args} toast={{ message: "Link copied", duration: 500 }} />,
    play: async ({ args, canvas }) => {
        await userEvent.click(canvas.getByRole("button", { name: "Save" }));
        await expect(canvas.getByRole("status")).toHaveTextContent("Link copied");
        await waitFor(() => expect(args.onDismiss).toHaveBeenCalled(), { timeout: 2000 });
        await expect(canvas.queryByRole("status")).toBeNull();
    },
};

/**
 * With the given `toasts`, as in the draft.
 */
export const Static: Story = {
    args: {
        toasts: [{ id: "saved", message: "Saved – the change is live", action: { label: "Undo", onClick: fn() }, duration: 3_600_000 }],
    },
};
