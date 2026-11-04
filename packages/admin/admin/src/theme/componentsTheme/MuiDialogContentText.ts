import { mergeOverrideStyles } from "../utils/mergeOverrideStyles";
import type { GetMuiComponentTheme } from "./getComponentsTheme";

export const getMuiDialogContentText: GetMuiComponentTheme<"MuiDialogContentText"> = (component, { palette }) => ({
    ...component,
    styleOverrides: mergeOverrideStyles<"MuiDialogContentText">(component?.styleOverrides, {
        root: {
            color: palette.text.primary,
            marginBottom: 20,
        },
    }),
});
