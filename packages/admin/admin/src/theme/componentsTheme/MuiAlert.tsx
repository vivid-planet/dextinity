import { Check, Error, Info, Warning } from "@dextinity/admin-icons";
import { alertClasses } from "@mui/material";

import { mergeOverrideStyles } from "../utils/mergeOverrideStyles";
import type { GetMuiComponentTheme } from "./getComponentsTheme";

export const getMuiAlert: GetMuiComponentTheme<"MuiAlert"> = (component, { palette, spacing, shadows }) => ({
    ...component,
    defaultProps: {
        variant: "outlined",

        iconMapping: {
            info: <Info color="info" />,
            success: <Check color="success" />,
            error: <Error color="error" />,
            warning: <Warning color="warning" />,
        },
        ...component?.defaultProps,
    },
    styleOverrides: mergeOverrideStyles<"MuiAlert">(component?.styleOverrides, {
        root: {},
        outlined: {
            backgroundColor: palette.background.paper,
            color: palette.grey[800],
            borderRadius: spacing(1),
            borderLeftWidth: spacing(1),
            boxShadow: shadows[2],

            [`&.${alertClasses.colorSuccess}`]: {
                borderColor: palette.success.main,
            },

            [`&.${alertClasses.colorInfo}`]: {
                borderColor: palette.info.main,
            },

            [`&.${alertClasses.colorWarning}`]: {
                borderColor: palette.warning.main,
            },

            [`&.${alertClasses.colorError}`]: {
                borderColor: palette.error.main,
            },
        },
        icon: {
            marginRight: 0,
            padding: spacing("2px", 0),
        },
        message: {
            padding: spacing(0, 0, 0, 2),
        },
    }),
});
