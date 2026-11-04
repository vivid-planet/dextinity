import { dividerClasses, listItemIconClasses } from "@mui/material";

import { mergeOverrideStyles } from "../utils/mergeOverrideStyles";
import { commonListItemRootStyles } from "./commonListStyles";
import type { GetMuiComponentTheme } from "./getComponentsTheme";

export const getMuiMenuItem: GetMuiComponentTheme<"MuiMenuItem"> = (component) => ({
    ...component,
    styleOverrides: mergeOverrideStyles<"MuiMenuItem">(component?.styleOverrides, {
        root: {
            ...commonListItemRootStyles,
            minHeight: 0,

            [`.${listItemIconClasses.root}`]: {
                minWidth: 0,
            },

            [`&+.${dividerClasses.root}`]: {
                marginTop: 8,
                marginBottom: 8,
            },
        },
    }),
});
