import { createTheme } from "../../theme/createTheme.js";

export const showcaseColors = {
    brandBlue: "#403AF2",
    brandTeal: "#0FD1C7",
    header: "#15133D",
    onHeader: "#FFFFFF",
    brandSurface: "#ECEBFE",
    accent: "#F26B3A",
    accentSurface: "#FFE9DD",
    text: "#1C1A3A",
    mutedText: "#6B6A80",
    body: "#F4F4FA",
    content: "#FFFFFF",
};

const fontFamily = "Arial, sans-serif";

export const showcaseTheme = createTheme({
    sizes: { bodyWidth: 600, contentIndentation: { default: 40, mobile: 20 } },
    colors: { background: { body: showcaseColors.body, content: showcaseColors.content } },
    text: {
        fontFamily,
        color: showcaseColors.text,
        defaultVariant: "body",
        variants: {
            brand: { fontSize: "20px", lineHeight: "32px", fontWeight: 800, letterSpacing: "-0.02em" },
            eyebrow: {
                fontSize: "12px",
                lineHeight: "16px",
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: showcaseColors.brandBlue,
                bottomSpacing: "10px",
            },
            heading: {
                fontSize: { default: "30px", mobile: "24px" },
                lineHeight: { default: "36px", mobile: "30px" },
                fontWeight: 800,
                letterSpacing: "-0.02em",
            },
            subheading: { fontSize: "18px", lineHeight: "24px", fontWeight: 700, bottomSpacing: "8px" },
            body: { fontSize: "16px", lineHeight: "24px", bottomSpacing: "24px" },
            caption: { fontSize: "13px", lineHeight: "20px", color: showcaseColors.mutedText, bottomSpacing: "12px" },
            footer: { fontSize: "12px", lineHeight: "18px", color: showcaseColors.mutedText },
        },
    },
    button: {
        fontFamily,
        fontWeight: 700,
        fontSize: "15px",
        lineHeight: "20px",
        borderRadius: "999px",
        padding: "14px 28px",
        defaultVariant: "primary",
        variants: {
            primary: {
                backgroundColor: showcaseColors.brandBlue,
                backgroundImage: `linear-gradient(110deg, ${showcaseColors.brandBlue} 0%, #7B4DF5 45%, ${showcaseColors.brandTeal} 100%)`,
                color: "#FFFFFF",
            },
            accent: {
                backgroundColor: showcaseColors.accent,
                backgroundImage: `linear-gradient(110deg, #E8432E 0%, ${showcaseColors.accent} 45%, #FFB347 100%)`,
                color: "#FFFFFF",
            },
            secondary: {
                backgroundColor: showcaseColors.brandSurface,
                color: showcaseColors.brandBlue,
                padding: "10px 20px",
                fontSize: "14px",
            },
        },
    },
    divider: { height: 1, backgroundColor: "#E4E3F0" },
});
