import { buttonClasses, iconButtonClasses } from "@mui/material";

import { mergeOverrideStyles } from "../utils/mergeOverrideStyles";
import type { GetMuiComponentTheme } from "./getComponentsTheme";

export const getMuiTableCell: GetMuiComponentTheme<"MuiTableCell"> = (component, { palette, typography }) => ({
    ...component,
    styleOverrides: mergeOverrideStyles<"MuiTableCell">(component?.styleOverrides, {
        root: {
            position: "relative",
            borderBottomColor: palette.grey[100],
            paddingTop: 15,
            paddingBottom: 15,
            paddingLeft: 20,
            paddingRight: 20,

            [`& > .${buttonClasses.root}, & > ${iconButtonClasses.root}`]: {
                marginTop: -12,
                marginBottom: -10,
            },
        },
        head: {
            borderTop: `1px solid ${palette.grey[100]}`,
            fontSize: 14,
            lineHeight: "20px",
            fontWeight: typography.fontWeightMedium,

            "&:not(:first-of-type):not(:empty):before": {
                content: "''",
                position: "absolute",
                top: 15,
                left: 8,
                bottom: 15,
                backgroundColor: palette.grey[100],
                width: 2,
            },
        },
        body: {
            fontSize: 16,
            lineHeight: "20px",
        },
    }),
});
