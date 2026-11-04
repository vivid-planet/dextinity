import type { PaletteOptions } from "@mui/material/styles";

import { errorPalette, greyPalette, infoPalette, primaryPalette, secondaryPalette, successPalette, warningPalette } from "./colors";

export const paletteOptions: PaletteOptions = {
    primary: primaryPalette,
    secondary: secondaryPalette,
    error: errorPalette,
    warning: warningPalette,
    info: infoPalette,
    success: successPalette,
    grey: greyPalette,
    divider: greyPalette[100],
    text: {
        primary: greyPalette[900],
        secondary: greyPalette[300],
        disabled: greyPalette[200],
    },
    background: {
        default: greyPalette[50],
    },
    action: {
        active: greyPalette[400],
        disabled: greyPalette[200],
    },
    highlight: {
        purple: "#952F80",
        green: "#80B50C",
        orange: "#FFB31A",
        yellow: "#FFEB3B",
        red: "#D11700",
    },
};

declare module "@mui/material/styles" {
    interface Palette {
        highlight: {
            purple: string;
            green: string;
            orange: string;
            yellow: string;
            red: string;
        };
    }

    interface PaletteOptions {
        highlight?: {
            purple: string;
            green: string;
            orange: string;
            yellow: string;
            red: string;
        };
    }
}
