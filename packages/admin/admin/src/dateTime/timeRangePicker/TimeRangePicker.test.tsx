import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { cleanup, render, waitFor } from "test-utils";
import { afterEach, describe, expect, test, vi } from "vitest";

import { type TimeRange, TimeRangePicker } from "./TimeRangePicker";

describe("TimeRangePicker", () => {
    describe("paste", () => {
        afterEach(cleanup);

        const renderPicker = () => {
            const onChange = vi.fn();

            function Story() {
                const [value, setValue] = useState<TimeRange | undefined>({ start: "10:00", end: "12:00" });

                return (
                    <TimeRangePicker
                        value={value}
                        onChange={(timeRange) => {
                            setValue(timeRange);
                            onChange(timeRange);
                        }}
                    />
                );
            }

            return { onChange, rendered: render(<Story />) };
        };

        const getHoursSections = async (rendered: ReturnType<typeof render>) => {
            await waitFor(() => expect(rendered.getAllByRole("spinbutton", { name: "Hours" })).toHaveLength(2));

            return rendered.getAllByRole("spinbutton", { name: "Hours" });
        };

        test("Should set the start time when a 24-hour time is pasted into it", async () => {
            const user = userEvent.setup();
            const { onChange, rendered } = renderPicker();

            const [startHours] = await getHoursSections(rendered);
            await user.click(startHours);
            await user.paste("14:30");

            await waitFor(() => expect(onChange).toHaveBeenLastCalledWith({ start: "14:30", end: "12:00" }));
        });

        test("Should set the end time when a 24-hour time is pasted into it", async () => {
            const user = userEvent.setup();
            const { onChange, rendered } = renderPicker();

            const [, endHours] = await getHoursSections(rendered);
            await user.click(endHours);
            await user.paste("14:30");

            await waitFor(() => expect(onChange).toHaveBeenLastCalledWith({ start: "10:00", end: "14:30" }));
        });
    });
});
