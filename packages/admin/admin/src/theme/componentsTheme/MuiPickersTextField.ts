import type { Components } from "@mui/material/styles";

export const getMuiPickersTextField = (component: Components["MuiPickersTextField"]): Components["MuiPickersTextField"] => ({
    ...component,
    defaultProps: {
        variant: "standard",
        ...component?.defaultProps,
    },
});
