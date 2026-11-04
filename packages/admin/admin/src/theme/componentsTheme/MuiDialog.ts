import type { Components } from "@mui/material/styles";

import { mergeOverrideStyles } from "../utils/mergeOverrideStyles";
import type { GetMuiComponentTheme } from "./getComponentsTheme";

export const getMuiDialog: GetMuiComponentTheme<"MuiDialog"> = (component, { spacing }): Components["MuiDialog"] => ({
    ...component,
    styleOverrides: mergeOverrideStyles<"MuiDialog">(component?.styleOverrides, {
        paper: {
            borderRadius: 4,
            width: "100%",
            margin: spacing(8),
        },
        paperScrollPaper: {
            maxHeight: `calc(100% - ${spacing(16)})`,
        },
        paperWidthXs: {
            maxWidth: 350,
        },
        paperWidthSm: {
            maxWidth: 680,
        },
        paperWidthMd: {
            maxWidth: 1024,
        },
        paperWidthLg: {
            maxWidth: 1280,
        },
        paperWidthXl: {
            maxWidth: 1920,
        },
        paperFullWidth: {
            width: `calc(100% - ${spacing(16)})`,
        },
        paperFullScreen: {
            borderRadius: 0,
            maxWidth: "none",
            margin: 0,
        },
    }),
});
