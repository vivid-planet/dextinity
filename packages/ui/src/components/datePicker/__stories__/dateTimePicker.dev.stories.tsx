import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, screen, userEvent, waitFor, within } from "storybook/test";

import { themeDecorator } from "../../../storybook/themeDecorator";
import { Button } from "../../button/Button";
import { Field } from "../../field/Field";
import { DateTimePicker, type DateTimePickerProps } from "../DateTimePicker";
import styles from "./DatePicker.stories.module.scss";

function DateTimePickerWithReset(props: DateTimePickerProps) {
    const [value, setValue] = useState(props.value);
    return (
        <div className={styles.narrow}>
            <Field label="Publish at">
                <DateTimePicker
                    {...props}
                    value={value}
                    onChange={(next) => {
                        props.onChange(next);
                        setValue(next);
                    }}
                />
            </Field>
            <Button onClick={() => setValue(new Date(2026, 10, 6, 13, 0).toISOString())}>Load record</Button>
            <Button onClick={() => setValue(null)}>Reset</Button>
        </div>
    );
}

function DateTimePickerWithLoadedTimes(props: DateTimePickerProps) {
    const [isLoaded, setIsLoaded] = useState(false);
    return (
        <>
            <DateTimePickerWithReset {...props} isTimeDisabled={isLoaded ? props.isTimeDisabled : () => true} />
            <Button onClick={() => setIsLoaded(true)}>Load times</Button>
        </>
    );
}

const meta = {
    component: DateTimePicker,
    title: "Building blocks/Form fields/DateTimePicker",
    tags: ["development", "!autodocs", "!manifest"],
    decorators: [themeDecorator],
    render: (args) => <DateTimePickerWithReset {...args} />,
    args: { name: "publishAt", value: null, locale: "de-AT", onChange: fn() },
} satisfies Meta<typeof DateTimePicker>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * A time typed before the day is used once, so resetting the value from outside, e.g. a form reset, empties the time too.
 */
export const ResetAfterTypingTheTimeFirst: Story = {
    play: async ({ args, canvas }) => {
        const time = canvas.getByRole("textbox", { name: "Publish at Time" });
        await userEvent.type(time, "9:15");
        await userEvent.type(canvas.getByRole("textbox", { name: "Publish at" }), "1.12.2026");
        await userEvent.tab();
        await waitFor(() => expect(args.onChange).toHaveBeenCalledTimes(1));
        await userEvent.click(canvas.getByRole("button", { name: "Reset" }));
        await waitFor(() => expect(time).toHaveValue(""));
    },
};

/**
 * A time typed before the day is discarded once the value changes from outside, so it doesn't come back after a later reset.
 */
export const ResetAfterLoadingARecord: Story = {
    play: async ({ canvas }) => {
        const time = canvas.getByRole("textbox", { name: "Publish at Time" });
        await userEvent.type(time, "10:00");
        await userEvent.tab();
        await userEvent.click(canvas.getByRole("button", { name: "Load record" }));
        await waitFor(() => expect(time).toHaveValue("13:00"));
        await userEvent.click(canvas.getByRole("button", { name: "Reset" }));
        await waitFor(() => expect(time).toHaveValue(""));
    },
};

const opensAtTenOnSaturdays = (time: string, date: string) => new Date(date).getUTCDay() === 6 && time < "10:00";

/**
 * A kept time that can't be chosen on the new day leaves the value unchanged and shows an error, until the time is changed.
 */
export const KeptTimeDisabledOnTheNewDay: Story = {
    args: { value: new Date(2026, 10, 6, 8, 30).toISOString(), isTimeDisabled: opensAtTenOnSaturdays },
    play: async ({ args, canvas }) => {
        const date = canvas.getByRole("textbox", { name: "Publish at" });
        const time = canvas.getByRole("textbox", { name: "Publish at Time" });
        await userEvent.click(canvas.getByRole("button", { name: "Choose date" }));
        const grid = await screen.findByRole("grid", { name: "November 2026" });
        await userEvent.click(within(grid).getByRole("button", { name: "Samstag, 7. November 2026" }));
        await waitFor(() => expect(date).toHaveValue("07.11.2026"));
        await expect(time).toHaveAccessibleDescription("08:30 can't be chosen.");
        await expect(args.onChange).not.toHaveBeenCalled();

        await userEvent.clear(time);
        await userEvent.type(time, "10:00");
        await userEvent.tab();
        await waitFor(() => expect(args.onChange).toHaveBeenCalledWith(new Date(2026, 10, 7, 10, 0).toISOString()));
        await expect(time).not.toHaveAttribute("aria-invalid");
    },
};

/**
 * A time typed before the day is checked once the day is known.
 */
export const PendingTimeDisabledOnTheChosenDay: Story = {
    args: { isTimeDisabled: opensAtTenOnSaturdays },
    play: async ({ args, canvas }) => {
        const time = canvas.getByRole("textbox", { name: "Publish at Time" });
        await userEvent.type(time, "9:15");
        await userEvent.type(canvas.getByRole("textbox", { name: "Publish at" }), "7.11.2026");
        await userEvent.tab();
        await expect(time).toHaveAccessibleDescription("09:15 can't be chosen.");
        await expect(args.onChange).not.toHaveBeenCalled();
    },
};

/**
 * Without a time, a day on which midnight can't be chosen waits for a time, without an error.
 */
export const MidnightDisabledOnTheChosenDay: Story = {
    args: { isTimeDisabled: opensAtTenOnSaturdays },
    play: async ({ args, canvas }) => {
        const date = canvas.getByRole("textbox", { name: "Publish at" });
        const time = canvas.getByRole("textbox", { name: "Publish at Time" });
        await userEvent.type(date, "7.11.2026");
        await userEvent.tab();
        await expect(date).toHaveValue("07.11.2026");
        await expect(date).not.toHaveAttribute("aria-invalid");
        await expect(args.onChange).not.toHaveBeenCalled();

        await userEvent.type(time, "10:00");
        await userEvent.tab();
        await waitFor(() => expect(args.onChange).toHaveBeenCalledWith(new Date(2026, 10, 7, 10, 0).toISOString()));
    },
};

/**
 * A typed time that can't be chosen is checked again on the new day, and becomes the value's time where it can be chosen.
 */
export const RejectedTimeAllowedOnTheNewDay: Story = {
    args: { value: new Date(2026, 10, 7, 10, 30).toISOString(), isTimeDisabled: opensAtTenOnSaturdays },
    play: async ({ args, canvas }) => {
        const time = canvas.getByRole("textbox", { name: "Publish at Time" });
        await userEvent.clear(time);
        await userEvent.type(time, "9:00");
        await userEvent.tab();
        await expect(time).toHaveAccessibleDescription("09:00 can't be chosen.");

        await userEvent.click(canvas.getByRole("button", { name: "Choose date" }));
        const grid = await screen.findByRole("grid", { name: "November 2026" });
        await userEvent.click(within(grid).getByRole("button", { name: "Freitag, 6. November 2026" }));
        await waitFor(() => expect(args.onChange).toHaveBeenCalledWith(new Date(2026, 10, 6, 9, 0).toISOString()));
        await expect(time).toHaveValue("09:00");
        await expect(time).not.toHaveAttribute("aria-invalid");
    },
};

/**
 * A day that waits for an allowed time is checked again when `isTimeDisabled` changes, e.g. once the allowed times have loaded.
 */
export const KeptTimeAllowedOnceTheTimesLoad: Story = {
    args: { value: new Date(2026, 10, 6, 10, 30).toISOString(), isTimeDisabled: opensAtTenOnSaturdays },
    render: (args) => <DateTimePickerWithLoadedTimes {...args} />,
    play: async ({ args, canvas }) => {
        const time = canvas.getByRole("textbox", { name: "Publish at Time" });
        await userEvent.click(canvas.getByRole("button", { name: "Choose date" }));
        const grid = await screen.findByRole("grid", { name: "November 2026" });
        await userEvent.click(within(grid).getByRole("button", { name: "Samstag, 7. November 2026" }));
        await expect(time).toHaveAccessibleDescription("10:30 can't be chosen.");
        await expect(args.onChange).not.toHaveBeenCalled();

        await userEvent.click(canvas.getByRole("button", { name: "Load times" }));
        await waitFor(() => expect(args.onChange).toHaveBeenCalledWith(new Date(2026, 10, 7, 10, 30).toISOString()));
        await expect(time).not.toHaveAttribute("aria-invalid");
    },
};

/**
 * A typed time that the loaded times allow replaces the kept time of a day that waits for an allowed time.
 */
export const RejectedTimeUsedOnceTheTimesLoad: Story = {
    args: { value: new Date(2026, 10, 6, 8, 30).toISOString() },
    render: (args) => <DateTimePickerWithLoadedTimes {...args} />,
    play: async ({ args, canvas }) => {
        const time = canvas.getByRole("textbox", { name: "Publish at Time" });
        await userEvent.click(canvas.getByRole("button", { name: "Choose date" }));
        const grid = await screen.findByRole("grid", { name: "November 2026" });
        await userEvent.click(within(grid).getByRole("button", { name: "Samstag, 7. November 2026" }));
        await userEvent.clear(time);
        await userEvent.type(time, "9:00");
        await userEvent.tab();
        await expect(time).toHaveAccessibleDescription("09:00 can't be chosen.");

        await userEvent.click(canvas.getByRole("button", { name: "Load times" }));
        await waitFor(() => expect(args.onChange).toHaveBeenCalledWith(new Date(2026, 10, 7, 9, 0).toISOString()));
        await expect(args.onChange).toHaveBeenCalledTimes(1);
        await expect(time).toHaveValue("09:00");
    },
};
