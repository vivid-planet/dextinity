import { dialogTitleClasses } from "@mui/material";

import { mergeOverrideStyles } from "../utils/mergeOverrideStyles";
import type { GetMuiComponentTheme } from "./getComponentsTheme";

export const getMuiDialogContent: GetMuiComponentTheme<"MuiDialogContent"> = (component, { palette, breakpoints, spacing }) => ({
    ...component,
    styleOverrides: mergeOverrideStyles<"MuiDialogContent">(component?.styleOverrides, {
        root: {
            backgroundColor: palette.grey[50],
            padding: spacing(2),

            [`.${dialogTitleClasses.root} + &`]: {
                paddingTop: spacing(2),
            },

            [breakpoints.up("sm")]: {
                padding: spacing(8),

                [`.${dialogTitleClasses.root} + &`]: {
                    paddingTop: spacing(8),
                },
            },
        },
    }),
});
