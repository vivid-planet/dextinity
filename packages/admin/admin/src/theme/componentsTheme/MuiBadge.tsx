import { mergeOverrideStyles } from "../utils/mergeOverrideStyles";
import type { GetMuiComponentTheme } from "./getComponentsTheme";

export const getMuiBadge: GetMuiComponentTheme<"MuiBadge"> = (component, { spacing }) => ({
    ...component,
    styleOverrides: mergeOverrideStyles<"MuiBadge">(component?.styleOverrides, {
        root: ({ ownerState }) => {
            if (!ownerState.children) {
                return {
                    position: "static",
                };
            }
        },
        badge: ({ ownerState }) => {
            if (!ownerState.children) {
                return { transform: "none", position: "static" };
            }
        },
    }),
});
