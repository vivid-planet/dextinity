import { mergeOverrideStyles } from "../utils/mergeOverrideStyles";
import { commonListItemRootStyles } from "./commonListStyles";
import type { GetMuiComponentTheme } from "./getComponentsTheme";

export const getMuiListItem: GetMuiComponentTheme<"MuiListItem"> = (component, { spacing }) => ({
    ...component,
    styleOverrides: mergeOverrideStyles<"MuiListItem">(component?.styleOverrides, {
        root: {
            ...commonListItemRootStyles,
        },
    }),
});
