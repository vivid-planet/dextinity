import { mergeOverrideStyles } from "../utils/mergeOverrideStyles";
import type { GetMuiComponentTheme } from "./getComponentsTheme";

export const getMuiListItemText: GetMuiComponentTheme<"MuiListItemText"> = (component) => ({
    ...component,
    defaultProps: {
        slotProps: {
            primary: {
                variant: "body2",
                ...component?.defaultProps?.slotProps?.primary,
            },
            ...component?.defaultProps?.slotProps,
        },
        ...component?.defaultProps,
    },
    styleOverrides: mergeOverrideStyles<"MuiListItemText">(component?.styleOverrides, {
        root: {
            marginTop: 0,
            marginBottom: 0,
        },
        secondary: {
            fontSize: 13,
            lineHeight: "16px",
        },
    }),
});
