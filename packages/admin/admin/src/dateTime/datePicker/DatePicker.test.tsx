import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { cleanup, render, waitFor } from "test-utils";
import { afterEach, describe, expect, test, vi } from "vitest";

import { DatePicker } from "./DatePicker";

describe("DatePicker", () => {
    describe("paste", () => {
        afterEach(cleanup);

        const renderPicker = () => {
            const onChange = vi.fn();

            function Story() {
                const [value, setValue] = useState<string | undefined>("2026-03-07");

                return (
                    <DatePicker
                        value={value}
                        onChange={(date) => {
                            setValue(date);
                            onChange(date);
                        }}
                    />
                );
            }

            return { onChange, rendered: render(<Story />) };
        };

        test("Should set the date when an ISO date is pasted", async () => {
            const user = userEvent.setup();
            const { onChange, rendered } = renderPicker();

            await user.click(rendered.getByRole("spinbutton", { name: "Month" }));
            await user.paste("2024-01-15");

            await waitFor(() => expect(onChange).toHaveBeenLastCalledWith("2024-01-15"));
        });

        test("Should ignore the time when an ISO date and time is pasted", async () => {
            const user = userEvent.setup();
            const { onChange, rendered } = renderPicker();

            await user.click(rendered.getByRole("spinbutton", { name: "Month" }));
            await user.paste("2024-01-15T14:30:00Z");

            await waitFor(() => expect(onChange).toHaveBeenLastCalledWith("2024-01-15"));
        });

        test("Should set the date when a date in the field's format is pasted", async () => {
            const user = userEvent.setup();
            const { onChange, rendered } = renderPicker();

            await user.click(rendered.getByRole("spinbutton", { name: "Month" }));
            await user.paste("01/15/2024");

            await waitFor(() => expect(onChange).toHaveBeenLastCalledWith("2024-01-15"));
        });

        test("Should keep pasting into a single section working", async () => {
            const user = userEvent.setup();
            const { onChange, rendered } = renderPicker();

            await user.click(rendered.getByRole("spinbutton", { name: "Year" }));
            await user.paste("2024");

            await waitFor(() => expect(onChange).toHaveBeenLastCalledWith("2024-03-07"));
        });
    });
});
