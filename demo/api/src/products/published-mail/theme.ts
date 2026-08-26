import { createTheme } from "@dextinity/mail-react";

export const theme = createTheme({
    text: {
        defaultVariant: "body",
        variants: {
            heading: {
                fontSize: {
                    default: "32px",
                    mobile: "28px",
                },
                lineHeight: {
                    default: "38px",
                    mobile: "34px",
                },
            },
            body: {
                fontSize: {
                    default: "16px",
                    mobile: "14px",
                },
                lineHeight: {
                    default: "20px",
                    mobile: "16px",
                },
            },
        },
    },
});

declare module "@dextinity/mail-react" {
    interface TextVariants {
        heading: true;
        body: true;
    }
}
