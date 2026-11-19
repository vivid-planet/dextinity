import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, screen, userEvent, waitFor } from "storybook/test";

import { themeDecorator } from "../../../storybook/themeDecorator";
import { Button } from "../../button/Button";
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
