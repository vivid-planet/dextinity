import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, screen, userEvent, waitFor, within } from "storybook/test";

import { themeDecorator } from "../../../storybook/themeDecorator";
import fieldTokens from "../../field/Field.tokens.scss?raw";
import { DatePicker, type DatePickerProps } from "../DatePicker";
import datePickerTokens from "../DatePicker.tokens.scss?raw";
import styles from "./DatePicker.stories.module.scss";

/** Keeps the story controlled: choosing updates the local value; changing the `value` control starts over from it. */
function ControlledDatePicker(props: DatePickerProps) {
    const [value, setValue] = useState(props.value);
    return (
        <div className={styles.narrow}>
            <DatePicker
                {...props}
                value={value}
                onChange={(next) => {
                    props.onChange(next);
                    setValue(next);
                }}
            />
        </div>
    );
}

const meta = {
    component: DatePicker,
    title: "Building blocks/Form fields/DatePicker",
    decorators: [themeDecorator],
    parameters: { tokens: `${datePickerTokens}\n${fieldTokens}`, popupRoom: { side: "below", minHeight: "420px" } },
    render: (args) => <ControlledDatePicker key={String(args.value)} {...args} />,
    args: {
        name: "publishedOn",
        label: "Published on",
        value: "2026-11-06",
        onChange: fn(),
    },
    argTypes: {
        state: { control: "select", options: ["default", "success", "warning", "error"] },
        size: { control: "radio", options: ["small", "default", "large"] },
        locale: { control: "select", options: ["en-GB", "en-US", "de-AT", "fr-FR", "ja-JP"] },
        weekStartsOn: { control: "select", options: [0, 1, 2, 3, 4, 5, 6] },
        actions: { control: false },
        prefix: { control: false },
        suffix: { control: false },
        labels: { control: false },
        className: { control: false },
        slotProps: { control: false },
    },
} satisfies Meta<typeof DatePicker>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * **Rules**
 * - Always controlled: `value` + `onChange`. The value is a day as `YYYY-MM-DD`, without time and time zone, so it is the same day
 *   for everyone; use `DateTimePicker` for an instant.
 * - Typing is as valid as the calendar: show the expected format in `placeholder` or `helperText` where users may not know it.
 * - Limit the choice with `min` and `max` rather than validating after the fact.
 */
export const Default: Story = {
    args: { locale: "en-GB" },
    play: async ({ args, canvas }) => {
        await userEvent.click(canvas.getByRole("button", { name: "Choose date" }));
        const grid = await screen.findByRole("grid", { name: "November 2026" });
        const chosenDay = within(grid).getByRole("button", { name: "Friday, 6 November 2026" });
        await waitFor(() => expect(chosenDay).toHaveFocus());
        await userEvent.click(within(grid).getByRole("button", { name: "Thursday, 12 November 2026" }));
        await waitFor(() => expect(args.onChange).toHaveBeenCalledWith("2026-11-12"));
        await waitFor(() => expect(canvas.getByRole("textbox", { name: "Published on" })).toHaveValue("12/11/2026"));
        await waitFor(() => expect(canvas.getByRole("textbox", { name: "Published on" })).toHaveFocus());
    },
};

/**
 * In the calendar, the arrow keys move by day and week, Home and End to the start and end of the week, Page Up and Page Down by month –
 * with Shift by year –, and Enter chooses. Alt + Arrow Down opens the calendar from the input; Escape closes it.
 */
export const Keyboard: Story = {
    args: { locale: "en-GB" },
    play: async ({ args, canvas }) => {
        const input = canvas.getByRole("textbox", { name: "Published on" });
        input.focus();
        await userEvent.keyboard("{Alt>}{ArrowDown}{/Alt}");
        await waitFor(() => expect(screen.getByRole("button", { name: "Friday, 6 November 2026" })).toHaveFocus());
        await userEvent.keyboard("{ArrowDown}{ArrowRight}");
        await waitFor(() => expect(screen.getByRole("button", { name: "Saturday, 14 November 2026" })).toHaveFocus());
        await userEvent.keyboard("{PageDown}");
        await waitFor(() => expect(screen.getByRole("button", { name: "Monday, 14 December 2026" })).toHaveFocus());
        await userEvent.keyboard("{Home}");
        await waitFor(() => expect(screen.getByRole("button", { name: "Monday, 14 December 2026" })).toHaveFocus());
        await userEvent.keyboard("{End}");
        await waitFor(() => expect(screen.getByRole("button", { name: "Sunday, 20 December 2026" })).toHaveFocus());
        await userEvent.keyboard("{Shift>}{PageUp}{/Shift}");
        await waitFor(() => expect(screen.getByRole("button", { name: "Saturday, 20 December 2025" })).toHaveFocus());
        await userEvent.keyboard("{Enter}");
        await waitFor(() => expect(args.onChange).toHaveBeenCalledWith("2025-12-20"));
        // The calendar hands the focus back to the input once it has closed; Alt + Arrow Down only opens it from there
        await waitFor(() => expect(input).toHaveFocus());
        await userEvent.keyboard("{Alt>}{ArrowDown}{/Alt}");
        await screen.findByRole("grid");
        await userEvent.keyboard("{Escape}");
        await waitFor(() => expect(screen.queryByRole("grid")).not.toBeInTheDocument());
        await waitFor(() => expect(input).toHaveFocus());
    },
};

/**
 * Typed dates follow the locale's order of day, month, and year, with any separator, or none: `24.12.2026`, `24/12/26`, `24122026`. A
 * typed date is read on blur or Enter. Text that is no valid day stays in the field with an error that shows the expected format, and
 * the value stays as it was until the text is corrected; Escape brings the value's text back.
 */
export const Typing: Story = {
    args: { locale: "de-AT", value: null, placeholder: "TT.MM.JJJJ" },
    play: async ({ args, canvas }) => {
        const input = canvas.getByRole("textbox", { name: "Published on" });
        await userEvent.type(input, "24/12/26");
        await userEvent.tab();
        await waitFor(() => expect(args.onChange).toHaveBeenCalledWith("2026-12-24"));
        await expect(input).toHaveValue("24.12.2026");
        await userEvent.clear(input);
        await userEvent.type(input, "31.2.2026{Enter}");
        await expect(input).toHaveValue("31.2.2026");
        await expect(input).toHaveAttribute("aria-invalid", "true");
        await expect(input).toHaveAccessibleDescription(/^Enter a date like 24\.12\.\d{4}\.$/);
        await expect(args.onChange).toHaveBeenCalledTimes(1);
        await userEvent.clear(input);
        await expect(input).not.toHaveAttribute("aria-invalid");
        await userEvent.type(input, "1.2.2026{Enter}");
        await waitFor(() => expect(args.onChange).toHaveBeenLastCalledWith("2026-02-01"));
        await expect(input).toHaveValue("01.02.2026");

        await userEvent.clear(input);
        await userEvent.type(input, "next week{Enter}");
        await expect(input).toHaveAccessibleDescription(/^Enter a date like 24\.12\.\d{4}\.$/);
        await userEvent.keyboard("{Escape}");
        await expect(input).toHaveValue("01.02.2026");
        await expect(input).not.toHaveAttribute("aria-invalid");
    },
};

export const Placeholder: Story = {
    args: { value: null, placeholder: "DD/MM/YYYY", locale: "en-GB" },
};

/**
 * `min` and `max` limit the days that can be chosen, both inclusive. Days outside are struck through in the calendar, and a typed one
 * shows an error with the limits.
 */
export const MinAndMax: Story = {
    args: { locale: "en-GB", min: "2026-11-03", max: "2026-11-20", helperText: "Between 3 and 20 November" },
    play: async ({ args, canvas }) => {
        await userEvent.click(canvas.getByRole("button", { name: "Choose date" }));
        const grid = await screen.findByRole("grid");
        const before = within(grid).getByRole("button", { name: "Monday, 2 November 2026" });
        await expect(before).toHaveAttribute("aria-disabled", "true");
        await userEvent.click(before);
        await expect(args.onChange).not.toHaveBeenCalled();
        await expect(screen.getByRole("button", { name: "Previous month" })).toBeDisabled();
        await userEvent.click(screen.getByRole("combobox", { name: "Year" }));
        await waitFor(() => expect(screen.getAllByRole("option").map((option) => option.textContent)).toEqual(["2026"]));
        await userEvent.keyboard("{Escape}");
        await waitFor(() => expect(screen.queryByRole("option")).not.toBeInTheDocument());
        await userEvent.keyboard("{Escape}");

        const input = canvas.getByRole("textbox", { name: "Published on" });
        await userEvent.clear(input);
        await userEvent.type(input, "24/11/2026");
        await userEvent.tab();
        await expect(input).toHaveAccessibleDescription("Choose a date from 03/11/2026 to 20/11/2026.");
        await expect(args.onChange).not.toHaveBeenCalled();
    },
};

/**
 * `clearable` adds a button that removes the value. Removing all text from the input does the same.
 */
export const Clearable: Story = {
    args: { clearable: true },
    play: async ({ args, canvas }) => {
        await userEvent.click(canvas.getByRole("button", { name: "Clear" }));
        await waitFor(() => expect(args.onChange).toHaveBeenCalledWith(null));
        await expect(canvas.getByRole("textbox", { name: "Published on" })).toHaveValue("");
        await expect(canvas.queryByRole("button", { name: "Clear" })).not.toBeInTheDocument();
    },
};

/**
 * The menu next to the month switches the year, for days far away such as a date of birth; it offers the years between `min` and
 * `max`, or a hundred years around today. The month switches to choosing a month, where the arrows move by year.
 */
export const MonthAndYear: Story = {
    args: { locale: "en-GB", name: "birthday", label: "Date of birth", value: "1990-05-17" },
    play: async ({ canvas }) => {
        await userEvent.click(canvas.getByRole("button", { name: "Choose date" }));
        await userEvent.click(await screen.findByRole("combobox", { name: "Year" }));
        await userEvent.click(await screen.findByRole("option", { name: "1985" }));
        await waitFor(() => expect(screen.getByRole("grid", { name: "May 1985" })).toBeInTheDocument());
        await userEvent.click(screen.getByRole("button", { name: "May" }));
        await userEvent.click(screen.getByRole("button", { name: "Previous year" }));
        await userEvent.click(screen.getByRole("button", { name: "Aug" }));
        await waitFor(() => expect(screen.getByRole("grid", { name: "August 1984" })).toBeInTheDocument());
        await waitFor(() => expect(screen.getByRole("button", { name: "Friday, 17 August 1984" })).toHaveFocus());
    },
};

/**
 * The locale sets the format, the names of months and weekdays, and the first day of the week.
 */
export const Locales: Story = {
    render: (args) => (
        <div className={styles.row}>
            <ControlledDatePicker {...args} label="en-US" locale="en-US" />
            <ControlledDatePicker {...args} label="de-AT" locale="de-AT" />
            <ControlledDatePicker {...args} label="ja-JP" locale="ja-JP" />
        </div>
    ),
};

export const Error: Story = {
    args: {
        value: null,
        required: true,
        state: "error",
        validationMessage: "Enter the day the article was published.",
    },
    play: async ({ canvas }) => {
        await expect(canvas.getByRole("textbox", { name: /Published on/ })).toHaveAccessibleDescription("Enter the day the article was published.");
    },
};

export const Disabled: Story = {
    args: { disabled: true },
    play: async ({ canvas }) => {
        await expect(canvas.getByRole("button", { name: "Choose date" })).toBeDisabled();
    },
};

export const ReadOnly: Story = {
    args: { readOnly: true, clearable: true },
};

export const Small: Story = {
    args: { size: "small" },
};
