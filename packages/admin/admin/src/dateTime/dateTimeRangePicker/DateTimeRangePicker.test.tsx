import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { cleanup, render, waitFor } from "test-utils";
import { afterEach, describe, expect, test, vi } from "vitest";

import { type DateTimeRange, DateTimeRangePicker } from "./DateTimeRangePicker";

describe("DateTimeRangePicker", () => {
    describe("paste", () => {
        afterEach(cleanup);

        const start = new Date("2026-03-07T10:00");
        const end = new Date("2026-03-20T12:00");

        const renderPicker = () => {
            const onChange = vi.fn();

            function Story() {
                const [value, setValue] = useState<DateTimeRange | undefined>({ start, end });

                return (
                    <DateTimeRangePicker
                        value={value}
                        onChange={(dateTimeRange) => {
                            setValue(dateTimeRange);
                            onChange(dateTimeRange);
                        }}
                    />
                );
            }

            return { onChange, rendered: render(<Story />) };
        };

        const getMonthSections = async (rendered: ReturnType<typeof render>) => {
            await waitFor(() => expect(rendered.getAllByRole("spinbutton", { name: "Month" })).toHaveLength(2));

            return rendered.getAllByRole("spinbutton", { name: "Month" });
        };

        test("Should set the start date and time when an ISO date and time is pasted into it", async () => {
            const user = userEvent.setup();
            const { onChange, rendered } = renderPicker();

            const [startMonth] = await getMonthSections(rendered);
            await user.click(startMonth);
            await user.paste("2024-01-15T14:30");

            await waitFor(() => expect(onChange).toHaveBeenLastCalledWith({ start: new Date("2024-01-15T14:30"), end }));
        });

        test("Should set the end date and time when an ISO date and time is pasted into it", async () => {
            const user = userEvent.setup();
            const { onChange, rendered } = renderPicker();

            const [, endMonth] = await getMonthSections(rendered);
            await user.click(endMonth);
            await user.paste("2024-01-15T14:30");

            await waitFor(() => expect(onChange).toHaveBeenLastCalledWith({ start, end: new Date("2024-01-15T14:30") }));
        });
    });
});
