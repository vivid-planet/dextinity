import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, screen, userEvent, waitFor } from "storybook/test";

import { themeDecorator } from "../../../storybook/themeDecorator";
import { Button } from "../../button/Button";
import { Dialog } from "../../dialog/Dialog";
import { Field } from "../../field/Field";
import { DatePicker, type DatePickerProps } from "../DatePicker";
import styles from "./DatePicker.stories.module.scss";

function StatefulDatePicker(props: DatePickerProps) {
    const [value, setValue] = useState(props.value);
    return (
        <div className={styles.narrow}>
            <Field label="Published on">
                <DatePicker
                    {...props}
                    value={value}
                    onChange={(next) => {
                        props.onChange(next);
                        setValue(next);
                    }}
                />
            </Field>
        </div>
    );
}

const formSubmit = fn();

function DatePickerInForm(props: DatePickerProps) {
    return (
        <form
            onSubmit={(event) => {
                event.preventDefault();
                formSubmit();
            }}
        >
            <StatefulDatePicker {...props} />
            <Button type="submit">Save</Button>
        </form>
    );
}

function DatePickerWithEarlierDates(props: DatePickerProps) {
    const [min, setMin] = useState(props.min);
    return (
        <>
            <StatefulDatePicker {...props} min={min} />
            <Button onClick={() => setMin("2026-10-01")}>Allow earlier dates</Button>
        </>
    );
}

const dialogOpenChange = fn();

function DatePickerInDialog(props: DatePickerProps) {
    const [open, setOpen] = useState(true);
    return (
        <Dialog
            open={open}
            onOpenChange={(nextOpen) => {
                dialogOpenChange(nextOpen);
                setOpen(nextOpen);
            }}
            title="Edit article"
        >
            <StatefulDatePicker {...props} />
        </Dialog>
    );
}

const meta = {
    component: DatePicker,
    title: "Building blocks/Form fields/DatePicker",
    tags: ["development", "!autodocs", "!manifest"],
    decorators: [themeDecorator],
    render: (args) => <StatefulDatePicker {...args} />,
    args: { name: "publishedOn", value: "2026-11-16", locale: "en-GB", weekStartsOn: 1, onChange: fn() },
} satisfies Meta<typeof DatePicker>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * A key that doesn't move the focused day, such as Home on the first day of the week, leaves the focus where the next click puts it.
 */
export const FocusStaysOnTheMonthButtonsAfterAKeyThatDoesntMove: Story = {
    play: async ({ canvas }) => {
        await userEvent.click(canvas.getByRole("button", { name: "Choose date" }));
        await waitFor(() => expect(screen.getByRole("button", { name: "Monday, 16 November 2026" })).toHaveFocus());
        await userEvent.keyboard("{Home}");
        const nextMonth = screen.getByRole("button", { name: "Next month" });
        await userEvent.click(nextMonth);
        await screen.findByRole("grid", { name: "December 2026" });
        await expect(nextMonth).toHaveFocus();
    },
};

/**
 * Enter with typed text that can't be used keeps the surrounding form from being submitted.
 */
export const EnterWithAnErrorKeepsTheFormFromSubmitting: Story = {
    render: (args) => <DatePickerInForm {...args} />,
    play: async ({ canvas }) => {
        const input = canvas.getByRole("textbox", { name: "Published on" });
        await userEvent.clear(input);
        await userEvent.type(input, "next week{Enter}");
        await expect(input).toHaveAttribute("aria-invalid", "true");
        await expect(formSubmit).not.toHaveBeenCalled();
    },
};

/**
 * A click on a submit button right after typing text that can't be used keeps the surrounding form from being submitted.
 */
export const SubmitRightAfterTypingAnErrorKeepsTheFormFromSubmitting: Story = {
    render: (args) => <DatePickerInForm {...args} />,
    play: async ({ canvas }) => {
        const input = canvas.getByRole("textbox", { name: "Published on" });
        await userEvent.clear(input);
        await userEvent.type(input, "next week");
        await userEvent.click(canvas.getByRole("button", { name: "Save" }));
        await expect(input).toHaveAttribute("aria-invalid", "true");
        await expect(formSubmit).not.toHaveBeenCalled();
    },
};

/**
 * Typed text that can't be used is read again when the rules change, e.g. `min` of a linked picker, and used once they allow it.
 */
export const RejectedDayAllowedOnceTheRulesChange: Story = {
    args: { min: "2026-11-05" },
    render: (args) => <DatePickerWithEarlierDates {...args} />,
    play: async ({ args, canvas }) => {
        const input = canvas.getByRole("textbox", { name: "Published on" });
        await userEvent.clear(input);
        await userEvent.type(input, "01/11/2026");
        await userEvent.tab();
        await expect(input).toHaveAccessibleDescription("Choose 05/11/2026 or later.");

        await userEvent.click(canvas.getByRole("button", { name: "Allow earlier dates" }));
        await waitFor(() => expect(args.onChange).toHaveBeenCalledWith("2026-11-01"));
        await expect(input).not.toHaveAttribute("aria-invalid");
    },
};

/**
 * Escape first discards typed text and leaves a surrounding dialog open; without typed text, it closes the dialog.
 */
export const EscapeInADialog: Story = {
    render: (args) => <DatePickerInDialog {...args} />,
    play: async () => {
        const input = await screen.findByRole("textbox", { name: "Published on" });
        await userEvent.clear(input);
        await userEvent.type(input, "07/11");
        await userEvent.keyboard("{Escape}");
        await expect(input).toHaveValue("16/11/2026");
        await expect(dialogOpenChange).not.toHaveBeenCalled();

        await userEvent.keyboard("{Escape}");
        await waitFor(() => expect(screen.queryByRole("dialog", { name: "Edit article" })).not.toBeInTheDocument());
    },
};
