import { createTheme, ThemeProvider } from "@mui/material";
import { pickersInputBaseClasses } from "@mui/x-date-pickers";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { cleanup, render, waitFor } from "test-utils";
import { afterEach, describe, expect, test, vi } from "vitest";

import { type DateRange, DateRangePicker } from "./DateRangePicker";

describe("DateRangePicker", () => {
    describe("paste", () => {
        afterEach(cleanup);

        const renderPicker = () => {
            const onChange = vi.fn();

            function Story() {
                const [value, setValue] = useState<DateRange | undefined>({ start: "2026-03-07", end: "2026-03-20" });

                return (
                    <DateRangePicker
                        value={value}
                        onChange={(dateRange) => {
                            setValue(dateRange);
                            onChange(dateRange);
                        }}
                    />
                );
            }

            const rendered = render(<Story />);

            return { onChange, rendered };
        };

        const getMonthSections = async (rendered: ReturnType<typeof render>) => {
            await waitFor(() => expect(rendered.getAllByRole("spinbutton", { name: "Month" })).toHaveLength(2));

            return rendered.getAllByRole("spinbutton", { name: "Month" });
        };

        test("Should set the start date when an ISO date is pasted into it", async () => {
            const user = userEvent.setup();
            const { onChange, rendered } = renderPicker();

            const [startMonth] = await getMonthSections(rendered);
            await user.click(startMonth);
            await user.paste("2024-01-15");

            await waitFor(() => expect(onChange).toHaveBeenLastCalledWith({ start: "2024-01-15", end: "2026-03-20" }));
        });

        test("Should set the end date when an ISO date is pasted into it", async () => {
            const user = userEvent.setup();
            const { onChange, rendered } = renderPicker();

            const [, endMonth] = await getMonthSections(rendered);
            await user.click(endMonth);
            await user.paste("2024-01-15");

            await waitFor(() => expect(onChange).toHaveBeenLastCalledWith({ start: "2026-03-07", end: "2024-01-15" }));
        });
    });

    test("Should apply defaultProps defined in the theme", async () => {
        const theme = createTheme({
            components: {
                DextinityAdminDateRangePicker: {
                    defaultProps: {
                        disabled: true,
                    },
                },
            },
        });

        const rendered = render(
            <ThemeProvider theme={theme}>
                <DateRangePicker />
            </ThemeProvider>,
        );

        await waitFor(() => expect(rendered.container.querySelector(`.${pickersInputBaseClasses.disabled}`)).not.toBeNull());
    });
});
