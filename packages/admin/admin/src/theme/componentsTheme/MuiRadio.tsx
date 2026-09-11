import { RadioChecked, RadioUnchecked } from "@dextinity/admin-icons";
import { radioClasses, svgIconClasses } from "@mui/material";
import type { Components } from "@mui/material/styles";

import { mergeOverrideStyles } from "../utils/mergeOverrideStyles";
import type { GetMuiComponentTheme } from "./getComponentsTheme";

export const getMuiRadio: GetMuiComponentTheme<"MuiRadio"> = (component, { palette }): Components["MuiRadio"] => ({
    ...component,
    defaultProps: {
        color: "primary",
        icon: <RadioUnchecked />,
        checkedIcon: <RadioChecked />,
        ...component?.defaultProps,
    },
    styleOverrides: mergeOverrideStyles<"MuiRadio">(component?.styleOverrides, {
        root: {
            [`& .${svgIconClasses.root}`]: {
                "& .border": {
                    fill: "#fff",
                },
                "& .background": {
                    fill: palette.grey[100],
                },
            },
            [`&.${radioClasses.checked} .${svgIconClasses.root}`]: {
                "& .circle": {
                    fill: "#fff",
                },
            },
            [`&.${radioClasses.disabled} .${svgIconClasses.root}`]: {
                "& .border": {
                    fill: palette.grey[50],
                },
                "& .background": {
                    fill: palette.grey[100],
                },
            },
            [`&.${radioClasses.disabled}.${radioClasses.checked} .${svgIconClasses.root}`]: {
                "& .circle": {
                    fill: "#fff",
                },
                "& .background": {
                    fill: palette.grey[100],
                },
            },
        },
        colorPrimary: {
            [`&.${radioClasses.checked} .${svgIconClasses.root}`]: {
                "& .background": {
                    fill: palette.primary.main,
                },
            },
        },
    }),
});
