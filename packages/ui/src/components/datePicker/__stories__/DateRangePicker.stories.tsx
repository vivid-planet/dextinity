import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, screen, userEvent, waitFor, within } from "storybook/test";

import { fieldArgTypes, type FieldStoryArgs, splitFieldArgs, StoryField } from "../../../storybook/fieldStoryArgs";
import { useControlledArg } from "../../../storybook/storyArgs";
import { themeDecorator } from "../../../storybook/themeDecorator";
import type { DateRangePosition } from "../dateRange";
import { DateRangePicker, type DateRangePickerProps } from "../DateRangePicker";
import styles from "./DatePicker.stories.module.scss";

type DateRangePickerStoryArgs = DateRangePickerProps & FieldStoryArgs;

/** Binds the value to its story arg, so the Controls panel drives it and a change on the canvas updates the arg. */
function ControlledDateRangePicker({ storyId, ...args }: DateRangePickerStoryArgs & { storyId: string }) {
    const { field, control } = splitFieldArgs(args);
    const [value, setValue] = useControlledArg(control, "value", { id: storyId });
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
    render: (args, context) => <ControlledDateRangePicker {...args} storyId={context.id} />,
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
        isDateDisabled: { control: false },
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
 * Each end can be typed. A range never ends before it starts: a typed end before the start shows an error until either end is corrected.
 * Text that is no valid day shows an error.
 */
export const Typing: Story = {
    args: { locale: "de-AT", value: null, placeholder: "TT.MM.JJJJ" },
    play: async ({ args, canvas }) => {
        const start = canvas.getByRole("textbox", { name: "Campaign period Start" });
        const end = canvas.getByRole("textbox", { name: "Campaign period End" });
        await userEvent.type(start, "20.11.2026");
        await userEvent.tab();
        await waitFor(() => expect(args.onChange).toHaveBeenLastCalledWith({ start: "2026-11-20", end: null }));
        await userEvent.type(end, "2.11.2026");
        await userEvent.tab();
        await expect(end).toHaveAccessibleDescription("The end is before the start.");
        await expect(args.onChange).toHaveBeenCalledTimes(1);
        await userEvent.clear(start);
        await userEvent.type(start, "1.11.2026");
        await userEvent.tab();
        await waitFor(() => expect(args.onChange).toHaveBeenLastCalledWith({ start: "2026-11-01", end: "2026-11-02" }));

        // Text that is no valid day stays in its input with an error, also when the other end changes, and that end keeps its value
        await userEvent.clear(end);
        await userEvent.type(end, "32.11.2026{Enter}");
        await expect(end).toHaveValue("32.11.2026");
        await expect(end).toHaveAccessibleDescription(/^Enter a date like 24\.12\.\d{4}\.$/);
        await expect(args.onChange).toHaveBeenCalledTimes(2);
        await userEvent.clear(start);
        await userEvent.type(start, "2.11.2026");
        await userEvent.tab();
        await waitFor(() => expect(args.onChange).toHaveBeenLastCalledWith({ start: "2026-11-02", end: "2026-11-02" }));
        await expect(end).toHaveValue("32.11.2026");
    },
};

export const OneMonth: Story = {
    args: { months: 1 },
};

export const Clearable: Story = {
    args: { clearable: true },
};

export const MinAndMax: Story = {
    args: { min: "2026-11-02", max: "2027-01-31", description: "Campaigns run until the end of January" },
};

/**
 * `isDateDisabled` disables more days, such as weekends. A rule that ignores the position also applies to the days between the ends: a
 * range can't contain a weekend.
 */
export const DisabledDates: Story = {
    args: {
        locale: "en-GB",
        value: { start: "2027-08-02", end: "2027-08-06" },
        isDateDisabled: (date: string) => [0, 6].includes(new Date(date).getUTCDay()),
        description: "Weekdays only, not over a weekend",
    },
    play: async ({ args, canvas }) => {
        await userEvent.click(canvas.getByRole("button", { name: "Choose dates" }));
        const grid = await screen.findByRole("grid", { name: "August 2027" });
        const saturday = within(grid).getByRole("button", { name: "Saturday, 7 August 2027" });
        await expect(saturday).toHaveAttribute("aria-disabled", "true");
        await userEvent.click(saturday);
        await userEvent.click(within(grid).getByRole("button", { name: "Monday, 9 August 2027" }));
        const mondayAfterTheWeekend = within(grid).getByRole("button", { name: "Monday, 16 August 2027" });
        await waitFor(() => expect(mondayAfterTheWeekend).toHaveAttribute("aria-disabled", "true"));
        await userEvent.click(mondayAfterTheWeekend);
        await expect(args.onChange).not.toHaveBeenCalled();
        await userEvent.click(within(grid).getByRole("button", { name: "Friday, 13 August 2027" }));
        await waitFor(() => expect(args.onChange).toHaveBeenCalledWith({ start: "2027-08-09", end: "2027-08-13" }));

        const end = canvas.getByRole("textbox", { name: "Campaign period End" });
        await userEvent.clear(end);
        await userEvent.type(end, "14/08/2027");
        await userEvent.tab();
        await expect(end).toHaveAccessibleDescription("14/08/2027 can't be chosen.");
        await userEvent.clear(end);
        await userEvent.type(end, "20/08/2027");
        await userEvent.tab();
        await expect(end).toHaveAccessibleDescription("The range can't include 14/08/2027.");
        await expect(args.onChange).toHaveBeenCalledTimes(1);
    },
};

/**
 * `isDateDisabled` also gets where a day would lie in the range, so the start and the end can follow different rules, e.g. a campaign
 * that starts on a Monday and ends on a Friday. The rule returns `false` for `"between"`, so a campaign can run over the weekend.
 */
export const DisabledStartAndEndDays: Story = {
    args: {
        locale: "en-GB",
        value: { start: "2027-08-02", end: "2027-08-06" },
        isDateDisabled: (date: string, position: DateRangePosition) =>
            position !== "between" && new Date(date).getUTCDay() !== (position === "start" ? 1 : 5),
        description: "From a Monday to a Friday",
    },
    play: async ({ args, canvas }) => {
        await userEvent.click(canvas.getByRole("button", { name: "Choose dates" }));
        const grid = await screen.findByRole("grid", { name: "August 2027" });
        await expect(within(grid).getByRole("button", { name: "Friday, 13 August 2027" })).toHaveAttribute("aria-disabled", "true");
        await userEvent.click(within(grid).getByRole("button", { name: "Monday, 9 August 2027" }));
        await waitFor(() => expect(within(grid).getByRole("button", { name: "Monday, 16 August 2027" })).toHaveAttribute("aria-disabled", "true"));
        await expect(within(grid).getByRole("button", { name: "Friday, 13 August 2027" })).not.toHaveAttribute("aria-disabled");
        await userEvent.click(within(grid).getByRole("button", { name: "Friday, 20 August 2027" }));
        await waitFor(() => expect(args.onChange).toHaveBeenCalledWith({ start: "2027-08-09", end: "2027-08-20" }));

        const end = canvas.getByRole("textbox", { name: "Campaign period End" });
        await userEvent.clear(end);
        await userEvent.type(end, "16/08/2027");
        await userEvent.tab();
        await expect(end).toHaveAccessibleDescription("16/08/2027 can't be chosen.");
        await userEvent.clear(end);
        await userEvent.type(end, "13/08/2027");
        await userEvent.tab();
        await waitFor(() => expect(args.onChange).toHaveBeenLastCalledWith({ start: "2027-08-09", end: "2027-08-13" }));
    },
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
