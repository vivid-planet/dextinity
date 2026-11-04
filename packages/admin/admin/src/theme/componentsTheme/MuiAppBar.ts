import type { GetMuiComponentTheme } from "./getComponentsTheme";

export const getMuiAppBar: GetMuiComponentTheme<"MuiAppBar"> = (component) => ({
    ...component,
    defaultProps: {
        elevation: 0,
        ...component?.defaultProps,
    },
});
