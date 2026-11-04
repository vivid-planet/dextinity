import { mergeOverrideStyles } from "../utils/mergeOverrideStyles";
import type { GetMuiComponentTheme } from "./getComponentsTheme";

export const getMuiCardContent: GetMuiComponentTheme<"MuiCardContent"> = (component, { spacing }) => ({
    ...component,
    styleOverrides: mergeOverrideStyles<"MuiCardContent">(component?.styleOverrides, {
        root: {
            padding: spacing(4),
            "&:last-child": {
                paddingBottom: spacing(4),
            },
        },
    }),
});
