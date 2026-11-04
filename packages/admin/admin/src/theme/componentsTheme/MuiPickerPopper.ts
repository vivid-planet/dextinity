import type { Components, Theme } from "@mui/material/styles";

import { mergeOverrideStyles } from "../utils/mergeOverrideStyles";

export const getMuiPickerPopper = (component: Components["MuiPickerPopper"], theme: Theme): Components["MuiPickerPopper"] => ({
    ...component,
    styleOverrides: mergeOverrideStyles(component?.styleOverrides, {
        paper: {
            boxShadow: theme.shadows[1],
        },
    }),
});
