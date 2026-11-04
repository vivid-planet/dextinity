import { mergeOverrideStyles } from "../utils/mergeOverrideStyles";
import type { GetMuiComponentTheme } from "./getComponentsTheme";

export const getMuiTableRow: GetMuiComponentTheme<"MuiTableRow"> = (component) => ({
    ...component,
    styleOverrides: mergeOverrideStyles<"MuiTableRow">(component?.styleOverrides, {
        root: {
            backgroundColor: "#fff",
        },
    }),
});
