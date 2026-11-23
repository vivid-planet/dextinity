import { createTheme, ThemeProvider } from "@mui/material";
import { pickersInputBaseClasses } from "@mui/x-date-pickers";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { cleanup, render, screen, waitFor } from "test-utils";
import { afterEach, describe, expect, test } from "vitest";

import { type DateRange, DateRangePicker } from "./DateRangePicker";

function ControlledDateRangePicker({ initialValue }: { initialValue: DateRange }) {
    const [value, setValue] = useState<DateRange | undefined>(initialValue);
    return (
        <>
            <DateRangePicker value={value} onChange={setValue} />
            <output>{value ? `${value.start ?? "empty"} - ${value.end ?? "empty"}` : "empty"}</output>
        </>
    );
}

describe("DateRangePicker", () => {
    afterEach(cleanup);

    test("Should apply defaultProps defined in the theme", async () => {
        const theme = createTheme({
            components: {
                CometAdminDateRangePicker: {
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

    test("Should keep a typed day that doesn't exist in the current month", async () => {
        const user = userEvent.setup();
        render(<ControlledDateRangePicker initialValue={{ start: "2026-11-01", end: "2026-11-15" }} />);

        await user.click((await screen.findAllByRole("spinbutton", { name: "Day" }))[1]);
        await user.keyboard("31");
        await user.click(screen.getAllByRole("spinbutton", { name: "Month" })[1]);
        await user.keyboard("12");

        expect(screen.getByRole("status")).toHaveTextContent("2026-11-01 - 2026-12-31");
    });
});
