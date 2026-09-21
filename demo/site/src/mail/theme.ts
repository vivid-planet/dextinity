import { createTheme } from "@dextinity/mail-react";

export const theme = createTheme({
    text: {
        defaultVariant: "copy",
        variants: {
            title: {
                fontSize: { default: "32px", mobile: "28px" },
                lineHeight: { default: "38px", mobile: "34px" },
                fontWeight: 700,
                bottomSpacing: "16px",
            },
            header: {
                fontSize: { default: "22px", mobile: "20px" },
                lineHeight: { default: "28px", mobile: "26px" },
                fontWeight: 700,
                bottomSpacing: "12px",
            },
            copy: {
                fontSize: { default: "16px", mobile: "14px" },
                lineHeight: { default: "24px", mobile: "20px" },
                bottomSpacing: "16px",
            },
            copySmall: {
                fontSize: { default: "13px", mobile: "12px" },
                lineHeight: { default: "20px", mobile: "18px" },
                bottomSpacing: "12px",
            },
        },
    },
    button: {
        defaultVariant: "filled",
        borderRadius: "4px",
        fontSize: "16px",
        fontWeight: 700,
        padding: "12px 24px",
        variants: {
            filled: { backgroundColor: "#1a1a1a", color: "#ffffff", border: "2px solid #1a1a1a" },
            outlined: { backgroundColor: "#ffffff", color: "#1a1a1a", border: "2px solid #1a1a1a" },
        },
    },
});

declare module "@dextinity/mail-react" {
    interface TextVariants {
        title: true;
        header: true;
        copy: true;
        copySmall: true;
    }

    interface ButtonVariants {
        filled: true;
        outlined: true;
    }
}
