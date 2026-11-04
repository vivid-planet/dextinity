import type { GetMuiComponentTheme } from "./getComponentsTheme";

export const getMuiInput: GetMuiComponentTheme<"MuiInput"> = (component) => ({
    ...component,
    defaultProps: {
        disableUnderline: true,
        ...component?.defaultProps,
    },
});
