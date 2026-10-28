import { Clear } from "@dextinity/admin-icons";
import { chipClasses } from "@mui/material";

import { mergeOverrideStyles } from "../utils/mergeOverrideStyles";
import type { GetMuiComponentTheme } from "./getComponentsTheme";

const getDeleteIconColorStyles = (color: string) => ({
    [`& .${chipClasses.deleteIcon}`]: {
        color,
        ["&:hover"]: {
            color,
        },
    },
});

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

            [`& .${chipClasses.icon}`]: {
                margin: 0,
                fontSize: 16,
                paddingRight: "6px",
            },

            [`& .${chipClasses.label}`]: {
                fontSize: 12,
                lineHeight: "16px",
                paddingLeft: 0,
                paddingRight: 0,
            },

            [`& .${chipClasses.deleteIcon}`]: {
                margin: 0,
                fontSize: 16,
                paddingLeft: 6,
            },
        },
        sizeSmall: {
            height: 20,
            padding: "4px 7px",

            [`& .${chipClasses.icon}`]: {
                margin: 0,
                fontSize: 12,
                paddingRight: "5px",
            },

            [`& .${chipClasses.label}`]: {
                fontSize: 10,
                lineHeight: "10px",
                paddingLeft: 0,
                paddingRight: 0,
            },

            [`& .${chipClasses.deleteIcon}`]: {
                margin: 0,
                fontSize: 12,
                paddingLeft: 5,
            },
        },
        colorDefault: getDeleteIconColorStyles("black"),
        colorPrimary: getDeleteIconColorStyles(palette.primary.contrastText),
        colorSecondary: getDeleteIconColorStyles(palette.secondary.contrastText),
        colorSuccess: getDeleteIconColorStyles(palette.success.contrastText),
        colorError: getDeleteIconColorStyles(palette.error.contrastText),
        colorWarning: getDeleteIconColorStyles(palette.warning.contrastText),
        colorInfo: getDeleteIconColorStyles(palette.info.contrastText),
        filled: {
            [`&.${chipClasses.colorDefault}`]: {
                backgroundColor: palette.grey["100"],
                [`&.${chipClasses.clickable}`]: {
                    "&:hover": {
                        backgroundColor: palette.grey["200"],
                    },
                },
            },

            [`&.${chipClasses.colorInfo}`]: {
                backgroundColor: "#fff",
                [`&.${chipClasses.clickable}`]: {
                    "&:hover": {
                        backgroundColor: palette.grey["50"],
                    },
                },
            },
        },
        outlined: {
            [`&.${chipClasses.colorDefault}`]: {
                borderColor: palette.grey["100"],
            },
        },
    }),
    defaultProps: {
        deleteIcon: <Clear />,
    },
});
