import type { ThemeComponents } from "./getComponentsTheme";

export const getMuiPickersTextField = (component: ThemeComponents["MuiPickersTextField"]): ThemeComponents["MuiPickersTextField"] => ({
    ...component,
    defaultProps: {
        variant: "standard",
        ...component?.defaultProps,
    },
});
