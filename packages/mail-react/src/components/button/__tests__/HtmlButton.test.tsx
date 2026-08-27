import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { createTheme } from "../../../theme/createTheme.js";
import { ThemeProvider } from "../../../theme/ThemeProvider.js";
import { generateHtmlButtonStyles, HtmlButton } from "../HtmlButton.js";

describe("HtmlButton", () => {
    it("renders an email-safe button with default props and no theme", () => {
        const html = renderToStaticMarkup(<HtmlButton>Click me</HtmlButton>);

        expect(html).toContain('href="#"');
        expect(html).toContain('target="_blank"');
        expect(html).toContain("text-decoration:none");
        // Outlook fallbacks: padding mirrored to mso-padding-alt, background repeated as a bgcolor attribute.
        expect(html).toContain("mso-padding-alt:10px 25px");
        expect(html).toContain('bgcolor="#414141"');
        expect(html).toContain("Click me");
    });

    it("follows theme text font family but keeps the base button font size", () => {
        const theme = createTheme({ text: { fontFamily: "Georgia, serif", fontSize: "18px" } });

        const html = renderToStaticMarkup(
            <ThemeProvider theme={theme}>
                <HtmlButton href="https://example.com">Click me</HtmlButton>
            </ThemeProvider>,
        );

        // Font family follows theme.text so the button blends with surrounding text,
        // but its size is a button style — matching MjmlButton, which never reads theme.text.fontSize.
        expect(html).toContain("font-family:Georgia, serif");
        expect(html).toContain("font-size:13px");
    });

    it("applies a variant over base styles", () => {
        const theme = createTheme({
            button: { variants: { primary: { backgroundColor: "#5B4FC7", color: "#FFFFFF" } } },
        });

        const html = renderToStaticMarkup(
            <ThemeProvider theme={theme}>
                <HtmlButton variant="primary">Primary</HtmlButton>
            </ThemeProvider>,
        );

        expect(html).toContain("background-color:#5B4FC7");
        expect(html).toContain("htmlButton--primary");
    });

    it("inherits base button styles not overridden by a variant", () => {
        const theme = createTheme({
            button: {
                backgroundColor: "#5B4FC7",
                variants: { primary: { color: "#FFFFFF" } },
            },
        });

        const html = renderToStaticMarkup(
            <ThemeProvider theme={theme}>
                <HtmlButton variant="primary">Primary</HtmlButton>
            </ThemeProvider>,
        );

        expect(html).toContain("background-color:#5B4FC7");
        expect(html).toContain("color:#FFFFFF");
    });

    it("applies defaultVariant when no variant prop is specified", () => {
        const theme = createTheme({
            button: {
                defaultVariant: "primary",
                variants: { primary: { backgroundColor: "#5B4FC7" } },
            },
        });

        const html = renderToStaticMarkup(
            <ThemeProvider theme={theme}>
                <HtmlButton>Primary</HtmlButton>
            </ThemeProvider>,
        );

        expect(html).toContain("background-color:#5B4FC7");
        expect(html).toContain("htmlButton--primary");
    });

    it("renders a gradient over the solid background color", () => {
        const theme = createTheme({
            button: {
                variants: {
                    gradient: {
                        backgroundColor: "#5B4FC7",
                        backgroundImage: "linear-gradient(to right, red, blue)",
                    },
                },
            },
        });

        const html = renderToStaticMarkup(
            <ThemeProvider theme={theme}>
                <HtmlButton variant="gradient">Gradient</HtmlButton>
            </ThemeProvider>,
        );

        expect(html).toContain("background-color:#5B4FC7");
        expect(html).toContain("background-image:linear-gradient(to right, red, blue)");
    });

    it("adds the full-width modifier class when fullWidth is set", () => {
        const html = renderToStaticMarkup(
            <HtmlButton href="https://example.com" fullWidth>
                Full width
            </HtmlButton>,
        );

        expect(html).toContain("htmlButton--fullWidth");
    });

    it("lets the consumer style prop layer over theme styles", () => {
        const html = renderToStaticMarkup(<HtmlButton style={{ backgroundColor: "#FF0000" }}>Click me</HtmlButton>);

        expect(html).toContain("background-color:#FF0000");
    });

    it("throws when variant is set without a ThemeProvider", () => {
        expect(() => renderToStaticMarkup(<HtmlButton variant="primary">Primary</HtmlButton>)).toThrow();
    });
});

describe("generateHtmlButtonStyles", () => {
    it("returns empty CSS when no variants are defined", () => {
        const theme = createTheme();
        expect(generateHtmlButtonStyles(theme)).toBe("");
    });

    it("emits responsive overrides targeting the variant anchor", () => {
        const theme = createTheme({
            button: { variants: { primary: { fontSize: { default: "13px", mobile: "16px" } } } },
        });

        const result = generateHtmlButtonStyles(theme);

        expect(result).toContain(".htmlButton--primary a");
        expect(result).toContain("font-size: 16px !important");
    });

    it("emits no media queries for a non-responsive variant", () => {
        const theme = createTheme({
            button: { variants: { primary: { fontSize: "16px" } } },
        });

        expect(generateHtmlButtonStyles(theme)).not.toContain("@media");
    });
});
