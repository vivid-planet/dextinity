import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, screen, userEvent, waitFor, within } from "storybook/test";

import { themeDecorator } from "../../../storybook/themeDecorator";
import fieldTokens from "../../field/_tokens.scss?raw";
import datePickerTokens from "../_tokens.scss?raw";
import { DateTimePicker, type DateTimePickerProps } from "../DateTimePicker";
import styles from "./DatePicker.stories.module.scss";

/** Keeps the story controlled: choosing updates the local value; changing the `value` control starts over from it. */
function ControlledDateTimePicker(props: DateTimePickerProps) {
    const [value, setValue] = useState(props.value);
    return (
        <div className={styles.narrow}>
            <DateTimePicker
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

const localInstant = (year: number, monthIndex: number, day: number, hours: number, minutes: number) =>
    new Date(year, monthIndex, day, hours, minutes).toISOString();

const meta = {
    component: DateTimePicker,
    title: "Building blocks/Form fields/DateTimePicker",
    decorators: [themeDecorator],
    parameters: { tokens: `${datePickerTokens}\n${fieldTokens}` },
    render: (args) => <ControlledDateTimePicker key={String(args.value)} {...args} />,
    args: {
        name: "publishAt",
        label: "Publish at",
        value: localInstant(2026, 10, 6, 8, 30),
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
} satisfies Meta<typeof DateTimePicker>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * **Rules**
 * - Always controlled: `value` + `onChange`. The value is an instant as an ISO 8601 date-time, shown and edited in the user's time
 *   zone – the format of GraphQL's `DateTime`.
 * - For a day without time, such as a publication date or a birthday, use `DatePicker`: an instant can fall on another day in another
 *   time zone.
 */
export const Default: Story = {
    args: { locale: "en-GB" },
    play: async ({ args, canvas }) => {
        await expect(canvas.getByRole("textbox", { name: "Publish at Time" })).toHaveValue("08:30");
        await userEvent.click(canvas.getByRole("button", { name: "Choose date" }));
        const grid = await screen.findByRole("grid", { name: "November 2026" });
        await userEvent.click(within(grid).getByRole("button", { name: "Tuesday, 10 November 2026" }));
        await waitFor(() => expect(args.onChange).toHaveBeenCalledWith(localInstant(2026, 10, 10, 8, 30)));
    },
};

/**
 * The time is typed with or without separator, in 24 hours or with am/pm: `14:45`, `1445`, `2:45 pm`. It is shown in the locale's
 * clock.
 */
export const TypingTheTime: Story = {
    args: { locale: "en-US" },
    play: async ({ args, canvas }) => {
        const time = canvas.getByRole("textbox", { name: "Publish at Time" });
        await expect(time).toHaveValue("08:30 AM");
        await userEvent.clear(time);
        await userEvent.type(time, "1445");
        await userEvent.tab();
        await waitFor(() => expect(args.onChange).toHaveBeenCalledWith(localInstant(2026, 10, 6, 14, 45)));
        await expect(time).toHaveValue("02:45 PM");
    },
};

/**
 * Without a time, choosing a day sets midnight. A time typed first is kept for the day chosen next.
 */
export const Empty: Story = {
    args: { value: null, locale: "de-AT", placeholder: "TT.MM.JJJJ", timePlaceholder: "hh:mm" },
    play: async ({ args, canvas }) => {
        await userEvent.type(canvas.getByRole("textbox", { name: "Publish at Time" }), "9:15");
        await userEvent.type(canvas.getByRole("textbox", { name: "Publish at" }), "1.12.2026");
        await userEvent.tab();
        await waitFor(() => expect(args.onChange).toHaveBeenCalledWith(localInstant(2026, 11, 1, 9, 15)));
    },
};

export const Clearable: Story = {
    args: { clearable: true },
};

export const MinAndMax: Story = {
    args: { min: "2026-11-01", max: "2026-12-31", helperText: "Until the end of the year" },
};

export const Error: Story = {
    args: {
        value: null,
        required: true,
        state: "error",
        validationMessage: "Choose when the article goes live.",
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
