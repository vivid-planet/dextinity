import { defaultButtonStyles } from "../components/button/defaultButtonStyles.js";
import { defaultDividerStyles } from "../components/divider/defaultDividerStyles.js";
import { createBreakpoint } from "./createBreakpoint.js";
import type { Theme } from "./themeTypes.js";

export const defaultTheme: Theme = {
    sizes: {
        bodyWidth: 600,
        contentIndentation: { default: 32, mobile: 16 },
    },
    breakpoints: {
        default: createBreakpoint(600),
        mobile: createBreakpoint(420),
    },
    text: {
        fontFamily: "Arial, sans-serif",
        fontSize: "16px",
        lineHeight: "20px",
        bottomSpacing: "16px",
        color: "#000000",
    },
    list: {
        indent: 8,
        markerGap: 12,
        itemSpacing: 8,
        unorderedMarker: "•",
        orderedMarker: ({ index }) => `${index + 1}.`,
    },
    divider: defaultDividerStyles,
    button: defaultButtonStyles,
    colors: {
        background: {
            body: "#F2F2F2",
            content: "#FFFFFF",
        },
    },
};
