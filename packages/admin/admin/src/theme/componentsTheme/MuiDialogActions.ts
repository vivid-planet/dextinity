import { mergeOverrideStyles } from "../utils/mergeOverrideStyles";
import type { GetMuiComponentTheme } from "./getComponentsTheme";

export const getMuiDialogActions: GetMuiComponentTheme<"MuiDialogActions"> = (component, { palette, breakpoints, spacing }) => ({
    ...component,
    styleOverrides: mergeOverrideStyles<"MuiDialogActions">(component?.styleOverrides, {
        root: {
            borderTop: `1px solid ${palette.grey[100]}`,
            padding: spacing(2),
            justifyContent: "space-between",

            [breakpoints.up("sm")]: {
                padding: spacing(4),
            },

            "&>:first-of-type:last-child": {
                marginLeft: "auto",
            },
        },
    }),
});
