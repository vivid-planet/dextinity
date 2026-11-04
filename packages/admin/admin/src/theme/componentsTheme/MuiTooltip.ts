import type { GetMuiComponentTheme } from "./getComponentsTheme";

export const getMuiTooltip: GetMuiComponentTheme<"MuiTooltip"> = (component) => ({
    ...component,
    defaultProps: {
        arrow: true,
    },
});
