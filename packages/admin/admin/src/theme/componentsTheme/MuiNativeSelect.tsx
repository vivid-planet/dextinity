import { inputBaseClasses, nativeSelectClasses } from "@mui/material";

import { mergeOverrideStyles } from "../utils/mergeOverrideStyles";
import { commonSelectDefaultProps, commonSelectStyleOverrides, getCommonIconStyleOverrides } from "./getCommonSelectTheme";
import type { GetMuiComponentTheme } from "./getComponentsTheme";

export const getMuiNativeSelect: GetMuiComponentTheme<"MuiNativeSelect"> = (component, { palette }) => ({
    ...component,
    defaultProps: {
        ...commonSelectDefaultProps,
        ...component?.defaultProps,
    },
    styleOverrides: mergeOverrideStyles<"MuiNativeSelect">(component?.styleOverrides, {
        select: {
            ...commonSelectStyleOverrides,
            [`&.${nativeSelectClasses.select}.${inputBaseClasses.input}`]: {
                paddingRight: 32,
            },
        },
        icon: getCommonIconStyleOverrides(palette),
    }),
});
