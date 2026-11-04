import { mergeOverrideStyles } from "../utils/mergeOverrideStyles";
import type { GetMuiComponentTheme } from "./getComponentsTheme";

export const getMuiTableFooter: GetMuiComponentTheme<"MuiTableFooter"> = (component, theme) => ({
    ...component,
    styleOverrides: mergeOverrideStyles<"MuiTableFooter">(component?.styleOverrides, {
        root: {
            ".MuiGrid-root": {
                gap: theme.spacing(4),
            },
        },
    }),
});
