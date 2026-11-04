import { mergeOverrideStyles } from "../utils/mergeOverrideStyles";
import type { GetMuiComponentTheme } from "./getComponentsTheme";

export const getMuiCardHeader: GetMuiComponentTheme<"MuiCardHeader"> = (component, { palette }) => ({
    ...component,
    styleOverrides: mergeOverrideStyles<"MuiCardHeader">(component?.styleOverrides, {
        root: {
            backgroundColor: palette.grey["A200"],
            color: "#fff",
            paddingBottom: "20px",
            paddingTop: "20px",
        },
        action: {
            lineHeight: 0,
            marginBottom: 0,
            marginTop: 0,
            alignSelf: "center",

            "& > .MuiButton-root": {
                marginTop: "-10px",
                marginBottom: "-10px",
            },
            "& > .MuiIconButton-root": {
                marginTop: "-10px",
                marginBottom: "-10px",
            },
        },
    }),
});
