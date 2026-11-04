import { mergeOverrideStyles } from "../utils/mergeOverrideStyles";
import type { GetMuiComponentTheme } from "./getComponentsTheme";

export const getMuiDialogTitle: GetMuiComponentTheme<"MuiDialogTitle"> = (component, { palette, breakpoints, spacing }) => ({
    ...component,
    defaultProps: {
        variant: "subtitle1",
    },
    styleOverrides: mergeOverrideStyles<"MuiDialogTitle">(component?.styleOverrides, {
        root: {
            display: "flex",
            alignItems: "center",
            backgroundColor: palette.grey["A200"],
            color: "#ffffff",
            padding: spacing(2, 4),
            fontSize: "14px",
            boxSizing: "border-box",
            minHeight: 50,

            [breakpoints.up("sm")]: {
                minWidth: 0,
                fontSize: "16px",
                minHeight: 60,
            },
        },
    }),
});
