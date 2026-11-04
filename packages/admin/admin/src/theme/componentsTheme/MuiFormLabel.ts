import { mergeOverrideStyles } from "../utils/mergeOverrideStyles";
import type { GetMuiComponentTheme } from "./getComponentsTheme";

export const getMuiFormLabel: GetMuiComponentTheme<"MuiFormLabel"> = (component, { palette, typography }) => ({
    ...component,
    styleOverrides: mergeOverrideStyles<"MuiFormLabel">(component?.styleOverrides, {
        root: {
            display: "block",
            color: palette.grey[900],
            fontSize: 16,
            lineHeight: "20px",
            fontWeight: typography.fontWeightBold,
            marginBottom: 4,

            "&.Mui-disabled": {
                color: palette.text.primary,
            },

            "&.Mui-focused": {
                color: palette.text.primary,
            },
        },
        asterisk: {
            marginLeft: "4px",
        },
    }),
});
