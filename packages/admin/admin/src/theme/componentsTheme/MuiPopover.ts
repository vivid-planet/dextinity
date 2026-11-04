import type { GetMuiComponentTheme } from "./getComponentsTheme";

export const getMuiPopover: GetMuiComponentTheme<"MuiPopover"> = (component) => ({
    ...component,
    defaultProps: {
        elevation: 1,
        ...component?.defaultProps,
    },
});
