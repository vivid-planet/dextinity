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
});
