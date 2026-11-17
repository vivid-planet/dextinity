import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, userEvent } from "storybook/test";

import { themeDecorator } from "../../../storybook/themeDecorator";
import { Field } from "../../field/Field";
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
