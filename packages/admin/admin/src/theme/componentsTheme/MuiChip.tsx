import { Clear } from "@dextinity/admin-icons";

import { mergeOverrideStyles } from "../utils/mergeOverrideStyles";
import type { GetMuiComponentTheme } from "./getComponentsTheme";

export const getMuiChip: GetMuiComponentTheme<"MuiChip"> = (component, { palette, spacing }) => ({
    ...component,
    styleOverrides: mergeOverrideStyles<"MuiChip">(component?.styleOverrides, {
        root: {
            borderRadius: 12,
            "&.Mui-disabled": {
                opacity: 0.5,
            },
        },
        sizeMedium: {
            height: 24,
            padding: "4px 10px",
        },
        iconMedium: {
            margin: 0,
            fontSize: 16,
            paddingRight: "6px",
        },
        labelMedium: {
            fontSize: 12,
            lineHeight: "16px",
            paddingLeft: 0,
            paddingRight: 0,
        },
        deleteIconMedium: {
            margin: 0,
            fontSize: 16,
            paddingLeft: 6,
        },
        sizeSmall: {
            height: 20,
            padding: "4px 7px",
        },
        iconSmall: {
            margin: 0,
            fontSize: 12,
            paddingRight: "5px",
        },
        labelSmall: {
            fontSize: 10,
            lineHeight: "10px",
            paddingLeft: 0,
            paddingRight: 0,
        },
        deleteIconSmall: {
            margin: 0,
            fontSize: 12,
            paddingLeft: 5,
        },
        deleteIconColorPrimary: {
            color: palette.primary.contrastText,
            ["&:hover"]: {
                color: palette.primary.contrastText,
            },
        },
        deleteIconColorSecondary: {
            color: palette.secondary.contrastText,
            ["&:hover"]: {
                color: palette.secondary.contrastText,
            },
        },
        // @ts-expect-error This keys exist but are missing in the types.
        deleteIconColorDefault: {
            color: "black",
            ["&:hover"]: {
                color: "black",
            },
        },
        deleteIconColorSuccess: {
            color: palette.success.contrastText,
            ["&:hover"]: {
                color: palette.success.contrastText,
            },
        },
        deleteIconColorError: {
            color: palette.error.contrastText,
            ["&:hover"]: {
                color: palette.error.contrastText,
            },
        },
        deleteIconColorWarning: {
            color: palette.warning.contrastText,
            ["&:hover"]: {
                color: palette.warning.contrastText,
            },
        },
        deleteIconColorInfo: {
            color: palette.info.contrastText,
            ["&:hover"]: {
                color: palette.info.contrastText,
            },
        },
        filledDefault: {
            backgroundColor: palette.grey["100"],
            "&.MuiChip-clickable": {
                "&:hover": {
                    backgroundColor: palette.grey["200"],
                },
            },
        },
        filledInfo: {
            backgroundColor: "#fff",
            "&.MuiChip-clickable": {
                "&:hover": {
                    backgroundColor: palette.grey["50"],
                },
            },
        },
        outlinedDefault: {
            borderColor: palette.grey["100"],
        },
    }),
    defaultProps: {
        deleteIcon: <Clear />,
    },
});
