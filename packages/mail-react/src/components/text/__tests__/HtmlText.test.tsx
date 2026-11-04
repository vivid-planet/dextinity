import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { createTheme } from "../../../theme/createTheme.js";
import { ThemeProvider } from "../../../theme/ThemeProvider.js";
import { HtmlText } from "../HtmlText.js";

// Type-level tests — validated by tsc, not at runtime.
// An unused @ts-expect-error directive causes a compile error if the overloads
// stop rejecting the invalid usage, so these act as regression guards.

// @ts-expect-error href is not valid on the default <td>
void (<HtmlText href="/foo">text</HtmlText>);

void (
    (
        // @ts-expect-error colSpan is not valid on <a>
        <HtmlText element="a" colSpan={2}>
            text
        </HtmlText>
    )
);

// Own props are always accepted regardless of element — no error expected
void (
    <HtmlText element="div" variant="heading" bottomSpacing>
        text
    </HtmlText>
);
void (
    <HtmlText variant="heading" bottomSpacing>
        text
    </HtmlText>
);

function renderHtmlText(element: React.ReactElement): string {
    return renderToStaticMarkup(element);
}

describe("HtmlText", () => {
    it("renders a <td> with base theme styles as inline styles", () => {
        const theme = createTheme();
        const html = renderHtmlText(
            <ThemeProvider theme={theme}>
                <HtmlText>Hello</HtmlText>
            </ThemeProvider>,
        );

        expect(html).toContain("<td");
        expect(html).toContain("Hello");
        expect(html).toContain("font-family:Arial, sans-serif");
        expect(html).toContain("font-size:16px");
        expect(html).toContain("line-height:20px");
    });

    it("applies variant styles over base styles", () => {
        const theme = createTheme({
            text: {
                variants: {
                    heading: { fontSize: { default: "32px", mobile: "24px" }, fontWeight: 700 },
                },
            },
        });

        const html = renderHtmlText(
            <ThemeProvider theme={theme}>
                <HtmlText variant="heading">Title</HtmlText>
            </ThemeProvider>,
        );

        expect(html).toContain("font-size:32px");
        expect(html).toContain("font-weight:700");
    });

    it("inherits base styles not overridden by variant", () => {
        const theme = createTheme({
            text: {
                fontFamily: "Georgia, serif",
                variants: {
                    heading: { fontSize: "32px" },
                },
            },
        });

        const html = renderHtmlText(
            <ThemeProvider theme={theme}>
                <HtmlText variant="heading">Title</HtmlText>
            </ThemeProvider>,
        );

        expect(html).toContain("font-family:Georgia, serif");
        expect(html).toContain("font-size:32px");
    });

    it("applies defaultVariant when no variant prop is specified", () => {
        const theme = createTheme({
            text: {
                defaultVariant: "body",
                variants: {
                    body: { fontSize: "14px" },
                },
            },
        });

        const html = renderHtmlText(
            <ThemeProvider theme={theme}>
                <HtmlText>Text</HtmlText>
            </ThemeProvider>,
        );

        expect(html).toContain("font-size:14px");
    });

    it("applies bottomSpacing as padding-bottom", () => {
        const theme = createTheme({ text: { bottomSpacing: "16px" } });
        const html = renderHtmlText(
            <ThemeProvider theme={theme}>
                <HtmlText bottomSpacing>Text</HtmlText>
            </ThemeProvider>,
        );

        expect(html).toContain("padding-bottom:16px");
    });

    it("uses variant bottomSpacing over base", () => {
        const theme = createTheme({
            text: {
                bottomSpacing: "16px",
                variants: {
                    heading: { bottomSpacing: { default: "24px", mobile: "16px" } },
                },
            },
        });

        const html = renderHtmlText(
            <ThemeProvider theme={theme}>
                <HtmlText variant="heading" bottomSpacing>
                    Title
                </HtmlText>
            </ThemeProvider>,
        );

        expect(html).toContain("padding-bottom:24px");
    });

    it("does not apply padding-bottom when bottomSpacing is not set", () => {
        const theme = createTheme({ text: { bottomSpacing: "16px" } });
        const html = renderHtmlText(
            <ThemeProvider theme={theme}>
                <HtmlText>Text</HtmlText>
            </ThemeProvider>,
        );

        expect(html).not.toContain("padding-bottom");
    });

    it("always applies the htmlText base class", () => {
        const theme = createTheme();
        const html = renderHtmlText(
            <ThemeProvider theme={theme}>
                <HtmlText>Hello</HtmlText>
            </ThemeProvider>,
        );

        expect(html).toContain('class="htmlText"');
    });

    it("applies variant modifier class", () => {
        const theme = createTheme({
            text: { variants: { heading: { fontSize: "32px" } } },
        });

        const html = renderHtmlText(
            <ThemeProvider theme={theme}>
                <HtmlText variant="heading">Title</HtmlText>
            </ThemeProvider>,
        );

        expect(html).toContain("htmlText--heading");
    });

    it("applies bottomSpacing modifier class", () => {
        const theme = createTheme();
        const html = renderHtmlText(
            <ThemeProvider theme={theme}>
                <HtmlText bottomSpacing>Text</HtmlText>
            </ThemeProvider>,
        );

        expect(html).toContain("htmlText--bottomSpacing");
    });

    it("merges consumer className", () => {
        const theme = createTheme();
        const html = renderHtmlText(
            <ThemeProvider theme={theme}>
                <HtmlText className="custom">Text</HtmlText>
            </ThemeProvider>,
        );

        expect(html).toContain("htmlText");
        expect(html).toContain("custom");
    });

    it("lets user style prop override theme styles", () => {
        const theme = createTheme({ text: { fontFamily: "Arial, sans-serif" } });
        const html = renderHtmlText(
            <ThemeProvider theme={theme}>
                <HtmlText style={{ fontFamily: "Georgia" }}>Hello</HtmlText>
            </ThemeProvider>,
        );

        expect(html).toContain("font-family:Georgia");
    });

    it("forwards standard td attributes", () => {
        const theme = createTheme();
        const html = renderHtmlText(
            <ThemeProvider theme={theme}>
                <HtmlText colSpan={2} align="center">
                    Hello
                </HtmlText>
            </ThemeProvider>,
        );

        expect(html).toContain('colSpan="2"');
        expect(html).toContain('align="center"');
    });

    it("renders a <div> when element is 'div'", () => {
        const theme = createTheme();
        const html = renderHtmlText(
            <ThemeProvider theme={theme}>
                <HtmlText element="div">Hello</HtmlText>
            </ThemeProvider>,
        );

        expect(html).toContain("<div");
        expect(html).not.toContain("<td");
        expect(html).toContain("Hello");
        expect(html).toContain("font-family:Arial, sans-serif");
    });

    it("renders an <a> with href when element is 'a'", () => {
        const theme = createTheme();
        const html = renderHtmlText(
            <ThemeProvider theme={theme}>
                <HtmlText element="a" href="/link">
                    Click
                </HtmlText>
            </ThemeProvider>,
        );

        expect(html).toContain("<a");
        expect(html).not.toContain("<td");
        expect(html).toContain('href="/link"');
        expect(html).toContain("Click");
    });

    it("applies theme styles and CSS classes to non-td elements", () => {
        const theme = createTheme({
            text: {
                variants: {
                    heading: { fontSize: "32px", fontWeight: 700 },
                },
            },
        });

        const html = renderHtmlText(
            <ThemeProvider theme={theme}>
                <HtmlText element="div" variant="heading" bottomSpacing className="custom">
                    Title
                </HtmlText>
            </ThemeProvider>,
        );

        expect(html).toContain("<div");
        expect(html).toContain("font-size:32px");
        expect(html).toContain("font-weight:700");
        expect(html).toContain("htmlText");
        expect(html).toContain("htmlText--heading");
        expect(html).toContain("htmlText--bottomSpacing");
        expect(html).toContain("custom");
    });
});
