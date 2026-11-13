import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, screen, userEvent, waitFor, within } from "storybook/test";

import { fieldArgTypes, type FieldStoryArgs, splitFieldArgs, StoryField } from "../../../storybook/fieldStoryArgs";
import { themeDecorator } from "../../../storybook/themeDecorator";
import fieldTokens from "../../field/Field.tokens.scss?raw";
import datePickerTokens from "../DatePicker.tokens.scss?raw";
import { DateRangePicker, type DateRangePickerProps } from "../DateRangePicker";
import styles from "./DatePicker.stories.module.scss";

type DateRangePickerStoryArgs = DateRangePickerProps & FieldStoryArgs;

/** Keeps the story controlled: choosing updates the local value; changing the `value` control starts over from it. */
function ControlledDateRangePicker(args: DateRangePickerStoryArgs) {
    const { field, control } = splitFieldArgs(args);
    const [value, setValue] = useState(control.value);
    return (
        <div className={styles.wide}>
            <StoryField field={field}>
                <DateRangePicker
                    {...control}
                    value={value}
                    onChange={(next) => {
                        control.onChange(next);
                        setValue(next);
                    }}
                />
            </StoryField>
        </div>
    );
}

const meta = {
    component: DateRangePicker,
    title: "Building blocks/Form fields/DateRangePicker",
    decorators: [themeDecorator],
    parameters: { tokens: `${datePickerTokens}\n${fieldTokens}` },
    render: (args) => <ControlledDateRangePicker key={JSON.stringify(args.value)} {...args} />,
    args: {
        name: "period",
        label: "Campaign period",
        value: { start: "2026-11-06", end: "2026-11-12" },
        onChange: fn(),
    },
    argTypes: {
        ...fieldArgTypes,
        months: { control: "radio", options: [1, 2] },
        locale: { control: "select", options: ["en-GB", "en-US", "de-AT", "fr-FR", "ja-JP"] },
        weekStartsOn: { control: "select", options: [0, 1, 2, 3, 4, 5, 6] },
        labels: { control: false },
        className: { control: false },
    },
} satisfies Meta<DateRangePickerStoryArgs>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * **Rules**
 * - Always controlled: `value` + `onChange`. Both ends are days as `YYYY-MM-DD` and inclusive; `null` means no range.
 * - The first click in the calendar chooses the start, the second the end; the days in between are previewed while pointing.
 */
export const Default: Story = {
    args: { locale: "en-GB" },
    play: async ({ args, canvas }) => {
        await userEvent.click(canvas.getByRole("button", { name: "Choose dates" }));
        const grid = await screen.findByRole("grid", { name: "November 2026" });
        await userEvent.click(within(grid).getByRole("button", { name: "Tuesday, 17 November 2026" }));
        await expect(args.onChange).not.toHaveBeenCalled();
        await userEvent.click(within(grid).getByRole("button", { name: "Monday, 9 November 2026" }));
        await waitFor(() => expect(args.onChange).toHaveBeenCalledWith({ start: "2026-11-09", end: "2026-11-17" }));
        await expect(canvas.getByRole("textbox", { name: "Campaign period Start" })).toHaveValue("09/11/2026");
        await expect(canvas.getByRole("textbox", { name: "Campaign period End" })).toHaveValue("17/11/2026");
    },
};

/**
 * Each end can be typed. A range never ends before it starts: typed ends are swapped. Text that is no valid day shows an error.
 */
export const Typing: Story = {
    args: { locale: "de-AT", value: null, placeholder: "TT.MM.JJJJ" },
    play: async ({ args, canvas }) => {
        await userEvent.type(canvas.getByRole("textbox", { name: "Campaign period Start" }), "20.11.2026");
        await userEvent.tab();
        await waitFor(() => expect(args.onChange).toHaveBeenLastCalledWith({ start: "2026-11-20", end: null }));
        await userEvent.type(canvas.getByRole("textbox", { name: "Campaign period End" }), "2.11.2026");
        await userEvent.tab();
        await waitFor(() => expect(args.onChange).toHaveBeenLastCalledWith({ start: "2026-11-02", end: "2026-11-20" }));

        // Text that is no valid day stays in its input with an error, and that end keeps its value
        const end = canvas.getByRole("textbox", { name: "Campaign period End" });
        await userEvent.clear(end);
        await userEvent.type(end, "32.11.2026{Enter}");
        await expect(end).toHaveValue("32.11.2026");
        await expect(end).toHaveAccessibleDescription(/^Enter a date like 24\.12\.\d{4}\.$/);
        await expect(args.onChange).toHaveBeenCalledTimes(2);
    },
};

export const OneMonth: Story = {
    args: { months: 1 },
};

export const Clearable: Story = {
    args: { clearable: true },
};

export const MinAndMax: Story = {
    args: { min: "2026-11-02", max: "2027-01-31", helperText: "Campaigns run until the end of January" },
};

export const Error: Story = {
    args: {
        value: { start: "2026-11-06", end: null },
        required: true,
        state: "error",
        validationMessage: "Choose when the campaign ends.",
    },
};

export const Disabled: Story = {
    args: { disabled: true },
};

export const ReadOnly: Story = {
    args: { readOnly: true },
};

export const Small: Story = {
    args: { size: "small" },
};
