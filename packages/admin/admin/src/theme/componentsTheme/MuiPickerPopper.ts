import type { Theme } from "@mui/material/styles";

import { mergeOverrideStyles } from "../utils/mergeOverrideStyles";
import type { ThemeComponents } from "./getComponentsTheme";

export const getMuiPickerPopper = (component: ThemeComponents["MuiPickerPopper"], theme: Theme): ThemeComponents["MuiPickerPopper"] => ({
    ...component,
    styleOverrides: mergeOverrideStyles(component?.styleOverrides, {
        paper: {
            boxShadow: theme.shadows[1],
        },
    }),
});
