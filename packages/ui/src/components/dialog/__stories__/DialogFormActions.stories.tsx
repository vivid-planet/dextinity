import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent } from "storybook/test";

import { themeDecorator } from "../../../storybook/themeDecorator";
import { Button } from "../../button/Button";
import { DialogFormActions } from "../DialogFormActions";

const meta = {
    component: DialogFormActions,
    title: "Building blocks/Modals & overlays/DialogFormActions",
    decorators: [themeDecorator],
    args: {
        formId: "new-folder",
        submitLabel: "Create",
        onCancel: fn(),
    },
    argTypes: {
        secondaryActions: { control: false },
        labels: { control: false },
        className: { control: false },
        slotProps: { control: false },
    },
} satisfies Meta<typeof DialogFormActions>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * Put it in the `footer` of a `Dialog` whose content holds the form; see the Dialog's "With form actions" story.
 *
 * **Rules**
 *
 * - The submit label is a verb for what happens, e.g. "Create" or "Save", not "OK".
 * - While the form submits, set `submitting` and turn off the dialog's `dismissible`.
 */
export const Default: Story = {
    play: async ({ args, canvas }) => {
        await expect(canvas.getByRole("button", { name: "Create" })).toHaveAttribute("form", "new-folder");
        await userEvent.click(canvas.getByRole("button", { name: "Cancel" }));
        await expect(args.onCancel).toHaveBeenCalledTimes(1);
    },
};

export const Submitting: Story = {
    args: { submitting: true },
    play: async ({ canvas }) => {
        await expect(canvas.getByRole("button", { name: "Cancel" })).toBeDisabled();
    },
};

/**
 * `submitDisabled` prevents submitting, e.g. until something was changed.
 */
export const SubmitDisabled: Story = {
    args: { submitDisabled: true },
};

/**
 * `secondaryActions` start the footer, e.g. a destructive action.
 */
export const WithSecondaryActions: Story = {
    args: {
        submitLabel: "Save",
        secondaryActions: (
            <Button variant="text" color="error">
                Delete
            </Button>
        ),
    },
};
