import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, screen, userEvent, waitFor, within } from "storybook/test";

import { themeDecorator } from "../../../storybook/themeDecorator";
import { Button } from "../../button/Button";
import { Field } from "../../field/Field";
import type { DateRangePosition } from "../dateRange";
import { DateRangePicker, type DateRangePickerProps } from "../DateRangePicker";
import styles from "./DatePicker.stories.module.scss";

function StatefulDateRangePicker(props: DateRangePickerProps) {
    const [value, setValue] = useState(props.value);
    return (
        <div className={styles.wide}>
            <Field label="Campaign period">
                <DateRangePicker
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

function DateRangePickerWithEarlierDates(props: DateRangePickerProps) {
    const [min, setMin] = useState(props.min);
    return (
        <>
            <StatefulDateRangePicker {...props} min={min} />
            <Button onClick={() => setMin("2026-10-01")}>Allow earlier dates</Button>
        </>
    );
}

const meta = {
    component: DateRangePicker,
    title: "Building blocks/Form fields/DateRangePicker",
    tags: ["development", "!autodocs", "!manifest"],
    decorators: [themeDecorator],
    render: (args) => <StatefulDateRangePicker {...args} />,
    args: { name: "period", value: { start: "2026-11-10", end: "2026-11-20" }, locale: "en-GB", onChange: fn() },
} satisfies Meta<typeof DateRangePicker>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * A typed start on the day of the end also makes that day the end, so the error names the end when only the end's rule disables it.
 */
export const TypedStartOnAnEndThatCantBeChosen: Story = {
    args: { isDateDisabled: (date, position) => position === "end" && date === "2026-11-20" },
    play: async ({ args, canvas }) => {
        const start = canvas.getByRole("textbox", { name: "Campaign period Start" });
        await userEvent.clear(start);
        await userEvent.type(start, "20/11/2026");
        await userEvent.tab();
        await expect(start).toHaveAccessibleDescription("20/11/2026 can't be chosen as the end.");
        await expect(args.onChange).not.toHaveBeenCalled();
    },
};

const startsOnMondaysEndsOnFridays = (date: string, position: DateRangePosition) =>
    position !== "between" && new Date(date).getUTCDay() !== (position === "start" ? 1 : 5);

/**
 * With only a start, the next click in the calendar chooses the end, so the days are checked as the end.
 */
export const OnlyAStartWaitsForTheEnd: Story = {
    args: { value: { start: "2026-11-09", end: null }, isDateDisabled: startsOnMondaysEndsOnFridays },
    play: async ({ args, canvas }) => {
        await userEvent.click(canvas.getByRole("button", { name: "Choose dates" }));
        const grid = await screen.findByRole("grid", { name: "November 2026" });
        await userEvent.click(within(grid).getByRole("button", { name: "Friday, 13 November 2026" }));
        await waitFor(() => expect(args.onChange).toHaveBeenCalledWith({ start: "2026-11-09", end: "2026-11-13" }));
    },
};

/**
 * With only a start that `isDateDisabled` disables, the first click in the calendar chooses a new start.
 */
export const OnlyADisabledStartWaitsForANewStart: Story = {
    args: { value: { start: "2026-11-09", end: null }, isDateDisabled: (date) => date === "2026-11-09" },
    play: async ({ args, canvas }) => {
        await userEvent.click(canvas.getByRole("button", { name: "Choose dates" }));
        const grid = await screen.findByRole("grid", { name: "November 2026" });
        await userEvent.click(within(grid).getByRole("button", { name: "Friday, 13 November 2026" }));
        await userEvent.click(within(grid).getByRole("button", { name: "Friday, 20 November 2026" }));
        await waitFor(() => expect(args.onChange).toHaveBeenCalledWith({ start: "2026-11-13", end: "2026-11-20" }));
    },
};

/**
 * With only a start before `min`, the first click in the calendar chooses a new start.
 */
export const OnlyAStartBeforeMinWaitsForANewStart: Story = {
    args: { value: { start: "2026-11-02", end: null }, min: "2026-11-05" },
    play: async ({ args, canvas }) => {
        await userEvent.click(canvas.getByRole("button", { name: "Choose dates" }));
        const grid = await screen.findByRole("grid", { name: "November 2026" });
        await userEvent.click(within(grid).getByRole("button", { name: "Friday, 13 November 2026" }));
        await expect(args.onChange).not.toHaveBeenCalled();
        await userEvent.click(within(grid).getByRole("button", { name: "Friday, 20 November 2026" }));
        await waitFor(() => expect(args.onChange).toHaveBeenCalledWith({ start: "2026-11-13", end: "2026-11-20" }));
    },
};

/**
 * With only a start, the calendar disables the ends of ranges that would contain a day disabled between the ends.
 */
export const OnlyAStartDisablesEndsBeyondADisabledDay: Story = {
    args: { value: { start: "2026-11-09", end: null }, isDateDisabled: (date) => [0, 6].includes(new Date(date).getUTCDay()) },
    play: async ({ canvas }) => {
        await userEvent.click(canvas.getByRole("button", { name: "Choose dates" }));
        const grid = await screen.findByRole("grid", { name: "November 2026" });
        await expect(within(grid).getByRole("button", { name: "Friday, 13 November 2026" })).not.toHaveAttribute("aria-disabled");
        await expect(within(grid).getByRole("button", { name: "Monday, 16 November 2026" })).toHaveAttribute("aria-disabled", "true");
    },
};

/**
 * With only an end, the calendar opens on the month of the end, with the focus on the nearest shown day that can be chosen as the start,
 * also when that day is in the next month.
 */
export const OnlyAnEndOpensOnItsMonth: Story = {
    args: { value: { start: null, end: "2028-03-31" }, isDateDisabled: startsOnMondaysEndsOnFridays },
    play: async ({ canvas }) => {
        await userEvent.click(canvas.getByRole("button", { name: "Choose dates" }));
        await screen.findByRole("grid", { name: "March 2028" });
        const nextMonthGrid = screen.getByRole("grid", { name: "April 2028" });
        await waitFor(() => expect(within(nextMonthGrid).getByRole("button", { name: "Monday, 3 April 2028" })).toHaveFocus());
    },
};

/**
 * Typed start and end that both can't be used are read again together when the rules change, so the range changes once.
 */
export const RejectedRangeAllowedOnceTheRulesChange: Story = {
    args: { value: { start: null, end: null }, min: "2026-11-10" },
    render: (args) => <DateRangePickerWithEarlierDates {...args} />,
    play: async ({ args, canvas }) => {
        await userEvent.type(canvas.getByRole("textbox", { name: "Campaign period Start" }), "01/11/2026");
        await userEvent.type(canvas.getByRole("textbox", { name: "Campaign period End" }), "05/11/2026");
        await userEvent.tab();

        await userEvent.click(canvas.getByRole("button", { name: "Allow earlier dates" }));
        await waitFor(() => expect(args.onChange).toHaveBeenCalledWith({ start: "2026-11-01", end: "2026-11-05" }));
        await expect(args.onChange).toHaveBeenCalledOnce();
    },
};
