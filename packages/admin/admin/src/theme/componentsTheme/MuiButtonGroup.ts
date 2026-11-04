import { buttonGroupClasses } from "@mui/material";

import { mergeOverrideStyles } from "../utils/mergeOverrideStyles";
import type { GetMuiComponentTheme } from "./getComponentsTheme";

export const getMuiButtonGroup: GetMuiComponentTheme<"MuiButtonGroup"> = (component, { palette }) => ({
    ...component,
    defaultProps: {
        disableElevation: true,
        ...component?.defaultProps,
    },
    styleOverrides: mergeOverrideStyles<"MuiButtonGroup">(component?.styleOverrides, {
        contained: {
            border: "none",
        },
        groupedContained: ({ ownerState }) => ({
            "&:not(:first-of-type)": {
                borderLeftWidth: 0,
            },

            ...(ownerState.color === "info" && {
                "&:not(:last-child)": {
                    borderColor: palette.grey[200],

                    [`&.${buttonGroupClasses.disabled}`]: {
                        borderColor: palette.grey[100],
                        borderRightColor: palette.grey[200],
                    },
                },
            }),
        }),
        groupedContainedHorizontal: {
            "&:not(:last-child)": {
                borderRightColor: palette.grey[200],

                [`&.${buttonGroupClasses.disabled}`]: {
                    borderColor: palette.grey[100],
                    borderRightColor: palette.grey[200],
                },
            },
        },
        groupedContainedPrimary: {
            "&:not(:last-child)": {
                borderColor: palette.primary.main,
                borderRightColor: palette.primary.dark,

                [`&.${buttonGroupClasses.disabled}`]: {
                    borderColor: palette.grey[100],
                    borderRightColor: palette.grey[200],
                },
            },
        },
        groupedContainedSecondary: {
            "&:not(:last-child)": {
                borderColor: palette.secondary.main,
                borderRightColor: palette.secondary.dark,

                [`&.${buttonGroupClasses.disabled}`]: {
                    borderColor: palette.grey[100],
                    borderRightColor: palette.grey[200],
                },
            },
        },
    }),
});
