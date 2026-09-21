import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { cleanup, render, waitFor } from "test-utils";
import { afterEach, describe, expect, test, vi } from "vitest";

import { TimePicker } from "./TimePicker";

describe("TimePicker", () => {
    describe("paste", () => {
        afterEach(cleanup);

        const renderPicker = () => {
            const onChange = vi.fn();

            function Story() {
                const [value, setValue] = useState<string | undefined>("10:00");

                return (
                    <TimePicker
                        value={value}
                        onChange={(time) => {
                            setValue(time);
                            onChange(time);
                        }}
                    />
                );
            }

            return { onChange, rendered: render(<Story />) };
        };

        test("Should set the time when a 24-hour time is pasted", async () => {
            const user = userEvent.setup();
            const { onChange, rendered } = renderPicker();

            await user.click(rendered.getByRole("spinbutton", { name: "Hours" }));
            await user.paste("14:30");

            await waitFor(() => expect(onChange).toHaveBeenLastCalledWith("14:30"));
        });

        test("Should ignore the seconds when a 24-hour time with seconds is pasted", async () => {
            const user = userEvent.setup();
            const { onChange, rendered } = renderPicker();

            await user.click(rendered.getByRole("spinbutton", { name: "Hours" }));
            await user.paste("14:30:45");

            await waitFor(() => expect(onChange).toHaveBeenLastCalledWith("14:30"));
        });

        test("Should set the time when a time in the field's format is pasted", async () => {
            const user = userEvent.setup();
            const { onChange, rendered } = renderPicker();

            await user.click(rendered.getByRole("spinbutton", { name: "Hours" }));
            await user.paste("02:30 PM");

            await waitFor(() => expect(onChange).toHaveBeenLastCalledWith("14:30"));
        });
    });
});
