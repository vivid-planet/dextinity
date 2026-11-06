import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, userEvent, waitFor } from "storybook/test";

import { themeDecorator } from "../../../storybook/themeDecorator";
import { Button } from "../../button/Button";
import { Icon } from "../../icon/Icon";
import { StatusIndicator } from "../../statusIndicator/StatusIndicator";
import { ToastViewport } from "../../toast/ToastViewport";
import { useToasts } from "../../toast/useToasts";
import { useUndoToast } from "../useUndoToast";
import styles from "./useUndoToast.stories.module.scss";

function ArchiveDemo() {
    const [archived, setArchived] = useState(false);
    const { toasts, add, dismiss } = useToasts();
    const { perform, block } = useUndoToast({ addToast: add });

    return (
        <div className={styles.demo}>
            <StatusIndicator status={archived ? "archived" : "published"} />
            <Button
                variant="outlined"
                color="secondary"
                startIcon={<Icon name="archive" />}
                disabled={archived}
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
            <Button
                variant="outlined"
                color="error"
                startIcon={<Icon name="delete" />}
                onClick={() => block("“logo.svg” is still in use · nothing deleted")}
            >
                Delete “logo.svg”
            </Button>
            <ToastViewport toasts={toasts} onDismiss={dismiss} />
        </div>
    );
}

const meta = {
    title: "Patterns/Undo instead of confirm/useUndoToast",
    decorators: [themeDecorator],
    render: () => <ArchiveDemo />,
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * `perform` runs the action at once and offers Undo in a toast for 8 seconds; `block` says why an action could not run.
 *
 * **Rules**
 *
 * - The toast says what happened, not what will happen.
 * - Undo restores exactly the previous state.
 */
export const Default: Story = {
    play: async ({ canvas }) => {
        await userEvent.click(canvas.getByRole("button", { name: "Archive “Benefits”" }));
        await expect(canvas.getByText("Archived")).toBeVisible();
        await waitFor(() => expect(canvas.getByText("“Benefits” archived")).toBeVisible());
        await userEvent.click(canvas.getByRole("button", { name: "Undo" }));
        await expect(canvas.getByText("Published")).toBeVisible();
        await waitFor(() => expect(canvas.getByText("“Benefits” restored")).toBeVisible());
    },
};

/**
 * An action that cannot run says why instead of asking.
 */
export const Blocked: Story = {
    play: async ({ canvas }) => {
        await userEvent.click(canvas.getByRole("button", { name: "Delete “logo.svg”" }));
        await waitFor(() => expect(canvas.getByRole("alert")).toHaveTextContent("“logo.svg” is still in use · nothing deleted"));
    },
};
