import { mergeOverrideStyles } from "../utils/mergeOverrideStyles";
import type { GetMuiComponentTheme } from "./getComponentsTheme";

export const getMuiTypography: GetMuiComponentTheme<"MuiTypography"> = (component) => ({
    ...component,
    defaultProps: {
        ...component?.defaultProps,
        variantMapping: {
            list: "ul",
            listItem: "li",
            ...component?.defaultProps?.variantMapping,
        },
    },
    styleOverrides: mergeOverrideStyles<"MuiTypography">(component?.styleOverrides, {
        gutterBottom: {
            marginBottom: 20,
        },
    }),
});
