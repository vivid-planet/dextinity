import { createTheme, ThemeProvider } from "@mui/material";
import { pickersInputBaseClasses } from "@mui/x-date-pickers";
import { render, waitFor } from "test-utils";
import { describe, expect, test } from "vitest";

import { DateRangePicker } from "./DateRangePicker";

describe("DateRangePicker", () => {
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

    test("Should apply the slot props of the open picker button", async () => {
        const rendered = render(<DateRangePicker slotProps={{ root: { slotProps: { openPickerButton: { "aria-label": "Choose dates" } } } }} />);

        await waitFor(() => expect(rendered.getByRole("button", { name: "Choose dates" })).toBeInTheDocument());
    });
});
