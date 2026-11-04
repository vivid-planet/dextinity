import { inputBaseClasses, tablePaginationClasses } from "@mui/material";

import { mergeOverrideStyles } from "../utils/mergeOverrideStyles";
import type { GetMuiComponentTheme } from "./getComponentsTheme";

export const getMuiTablePagination: GetMuiComponentTheme<"MuiTablePagination"> = (component, theme) => ({
    ...component,
    styleOverrides: mergeOverrideStyles<"MuiTablePagination">(component?.styleOverrides, {
        select: {
            [`&.${inputBaseClasses.input}.${tablePaginationClasses.select}`]: {
                paddingRight: 32,
            },
        },
        actions: {
            marginLeft: 0,
        },
    }),
});
