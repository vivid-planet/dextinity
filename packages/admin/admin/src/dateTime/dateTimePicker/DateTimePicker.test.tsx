import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { cleanup, render, waitFor } from "test-utils";
import { afterEach, describe, expect, test, vi } from "vitest";

import { DateTimePicker } from "./DateTimePicker";

describe("DateTimePicker", () => {
    describe("paste", () => {
        afterEach(cleanup);

        const renderPicker = () => {
            const onChange = vi.fn();

            function Story() {
                const [value, setValue] = useState<Date | undefined>(new Date("2026-03-07T10:00"));

                return (
                    <DateTimePicker
                        value={value}
                        onChange={(dateTime) => {
                            setValue(dateTime);
                            onChange(dateTime);
                        }}
                    />
                );
            }

            return { onChange, rendered: render(<Story />) };
        };

        test("Should set date and time when an ISO date and time is pasted", async () => {
            const user = userEvent.setup();
            const { onChange, rendered } = renderPicker();

            await user.click(rendered.getByRole("spinbutton", { name: "Month" }));
            await user.paste("2024-01-15T14:30:00");

            await waitFor(() => expect(onChange).toHaveBeenLastCalledWith(new Date("2024-01-15T14:30")));
        });

        test("Should set midnight when an ISO date without a time is pasted", async () => {
            const user = userEvent.setup();
            const { onChange, rendered } = renderPicker();

            await user.click(rendered.getByRole("spinbutton", { name: "Month" }));
            await user.paste("2024-01-15");

            await waitFor(() => expect(onChange).toHaveBeenLastCalledWith(new Date("2024-01-15T00:00")));
        });

        test("Should set date and time when a value in the field's format is pasted", async () => {
            const user = userEvent.setup();
            const { onChange, rendered } = renderPicker();

            await user.click(rendered.getByRole("spinbutton", { name: "Month" }));
            await user.paste("01/15/2024 02:30 PM");

            await waitFor(() => expect(onChange).toHaveBeenLastCalledWith(new Date("2024-01-15T14:30")));
        });
    });
});
