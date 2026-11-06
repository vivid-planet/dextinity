import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, userEvent, waitFor } from "storybook/test";

import { themeDecorator } from "../../../storybook/themeDecorator";
import { Button } from "../../button/Button";
import { DateTimePicker, type DateTimePickerProps } from "../DateTimePicker";
import styles from "./DatePicker.stories.module.scss";

function DateTimePickerWithReset(props: DateTimePickerProps) {
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
            <Button onClick={() => setValue(null)}>Reset</Button>
        </div>
    );
}

const meta = {
    component: DateTimePicker,
    title: "Building blocks/Form fields/DateTimePicker",
    tags: ["development", "!autodocs", "!manifest"],
    decorators: [themeDecorator],
    render: (args) => <DateTimePickerWithReset {...args} />,
    args: { name: "publishAt", label: "Publish at", value: null, locale: "de-AT", onChange: fn() },
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
