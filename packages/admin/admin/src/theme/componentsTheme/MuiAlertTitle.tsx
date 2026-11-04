import { mergeOverrideStyles } from "../utils/mergeOverrideStyles";
import type { GetMuiComponentTheme } from "./getComponentsTheme";

export const getMuiAlertTitle: GetMuiComponentTheme<"MuiAlertTitle"> = (component, { spacing }) => ({
    ...component,
    styleOverrides: mergeOverrideStyles<"MuiAlertTitle">(component?.styleOverrides, {
        root: {
            marginBottom: spacing(1),
            fontWeight: 600,
        },
    }),
});
