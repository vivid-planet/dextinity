import { mergeOverrideStyles } from "../utils/mergeOverrideStyles";
import type { GetMuiComponentTheme } from "./getComponentsTheme";

export const getMuiInputAdornment: GetMuiComponentTheme<"MuiInputAdornment"> = (component) => ({
    ...component,
    styleOverrides: mergeOverrideStyles(component?.styleOverrides, {
        root: {
            height: "auto",
            alignSelf: "stretch",
            maxHeight: "none",
        },
        positionStart: {
            marginRight: 0,
        },
        positionEnd: {
            marginLeft: 0,
        },
    }),
});
