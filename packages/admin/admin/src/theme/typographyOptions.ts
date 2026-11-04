import type { Breakpoints } from "@mui/material";
import type { TypographyVariantsOptions } from "@mui/material/styles";
import type { CSSProperties } from "react";

const fontFamily = "Roboto Flex Variable, Helvetica, Arial, sans-serif";

export const createTypographyOptions = (breakpoints: Breakpoints): TypographyVariantsOptions => ({
    fontFamily,
    h1: {
        fontFamily,
        fontSize: 36,
        lineHeight: "42px",
        fontWeight: 170,

        [breakpoints.up("md")]: {
            fontSize: 55,
            lineHeight: "64px",
        },
    },
    h2: {
        fontFamily,
        fontSize: 30,
        lineHeight: "38px",
        fontWeight: 160,

        [breakpoints.up("md")]: {
            fontSize: 44,
            lineHeight: "52px",
        },
    },
    h3: {
        fontFamily,
        fontSize: 24,
        lineHeight: "28px",
        fontWeight: 150,

        [breakpoints.up("md")]: {
            fontSize: 33,
            lineHeight: "39px",
        },
    },
    h4: {
        fontFamily,
        fontSize: 20,
        lineHeight: "26px",
        fontWeight: 150,

        [breakpoints.up("md")]: {
            fontSize: 24,
            lineHeight: "28px",
        },
    },
    h5: {
        fontFamily,
        fontSize: 16,
        lineHeight: "20px",
        fontWeight: 200,

        [breakpoints.up("md")]: {
            fontSize: 18,
            lineHeight: "21px",
        },
    },
    h6: {
        fontFamily,
        fontSize: 14,
        lineHeight: "18px",
        fontWeight: 550,
        textTransform: "uppercase",

        [breakpoints.up("md")]: {
            fontSize: 16,
            lineHeight: "20px",
        },
    },
    body1: {
        fontFamily,
        fontSize: 16,
        lineHeight: "20px",
        fontWeight: 250,
    },
    body2: {
        fontFamily,
        fontSize: 14,
        lineHeight: "20px",
        fontWeight: 250,
    },
    caption: {
        fontFamily,
        fontSize: 12,
        lineHeight: "16px",
        fontWeight: 300,
    },
    subtitle1: {
        fontFamily,
        fontSize: 16,
        lineHeight: "20px",
        fontWeight: 600,
        fontVariationSettings: "'wdth' 85",
    },
    subtitle2: {
        fontFamily,
        fontSize: 14,
        lineHeight: "20px",
        fontWeight: 600,
        fontVariationSettings: "'wdth' 85",
    },
    overline: {
        fontFamily,
        fontSize: 12,
        lineHeight: "16px",
        fontWeight: 600,
        fontVariationSettings: "'wdth' 80",
        textTransform: "none",
    },
    list: {
        paddingInlineStart: 30,
        paddingTop: 8,
        paddingBottom: 8,
    },
    listItem: {
        fontFamily,
        fontSize: 16,
        lineHeight: "20px",
        fontWeight: 250,
        paddingLeft: 0,
        paddingTop: 4,
        paddingBottom: 4,
    },
    button: {
        fontFamily,
        fontSize: 16,
        lineHeight: "20px",
        fontWeight: 250,

        [breakpoints.up("md")]: {
            lineHeight: "16px",
        },
    },
});

declare module "@mui/material/styles" {
    interface TypographyVariants {
        list: CSSProperties;
        listItem: CSSProperties;
    }

    interface TypographyVariantsOptions {
        list?: CSSProperties;
        listItem?: CSSProperties;
    }
}

declare module "@mui/material/Typography" {
    interface TypographyPropsVariantOverrides {
        list: true;
        listItem: true;
    }
}
