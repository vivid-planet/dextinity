import { MjmlColumn } from "@faire/mjml-react";
import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { renderMailHtml } from "../../../server/renderMailHtml.js";
import { createTheme } from "../../../theme/createTheme.js";
import { MjmlMailRoot } from "../../mailRoot/MjmlMailRoot.js";
import { MjmlSection } from "../../section/MjmlSection.js";
import { generateInlineBackgroundImageCss, generateMjmlButtonStyles, MjmlButton } from "../MjmlButton.js";

function renderInMailRoot(button: ReactNode, theme?: ReturnType<typeof createTheme>) {
    return renderMailHtml(
        <MjmlMailRoot theme={theme}>
            <MjmlSection>
                <MjmlColumn>{button}</MjmlColumn>
            </MjmlSection>
        </MjmlMailRoot>,
    );
}

describe("MjmlButton", () => {
    it("produces no MJML warnings for default, variant, and full-width buttons", () => {
        const theme = createTheme({
            button: {
                variants: {
                    primary: { backgroundColor: "#5B4FC7", color: "#FFFFFF" },
                    secondary: { backgroundColor: "#EEEEEE", color: "#222222" },
                },
            },
        });

        const { mjmlWarnings } = renderInMailRoot(
            <>
                <MjmlButton href="https://example.com">Default</MjmlButton>
                <MjmlButton href="https://example.com" variant="primary">
                    Primary
                </MjmlButton>
                <MjmlButton href="https://example.com" variant="secondary" fullWidth>
                    Full width
                </MjmlButton>
            </>,
            theme,
        );

        expect(mjmlWarnings).toEqual([]);
    });

    it("renders an anchor with default props when no theme is set", () => {
        const { html } = renderInMailRoot(<MjmlButton>Click me</MjmlButton>);

        expect(html).toContain("mjmlButton");
        expect(html).toContain('href="#"');
        expect(html).toContain('target="_blank"');
        expect(html).toContain("Click me");
    });

    it("applies theme base styles to the button", () => {
        const { html } = renderInMailRoot(
            <MjmlButton href="https://example.com">Click me</MjmlButton>,
            createTheme({ button: { backgroundColor: "#5B4FC7" } }),
        );

        expect(html).toContain("background:#5B4FC7");
    });

    it("applies the variant modifier class", () => {
        const { html } = renderInMailRoot(
            <MjmlButton href="https://example.com" variant="primary">
                Primary
            </MjmlButton>,
            createTheme({ button: { variants: { primary: { backgroundColor: "#5B4FC7" } } } }),
        );

        expect(html).toContain("mjmlButton--primary");
    });

    it("inherits base button styles not overridden by a variant", () => {
        const { html } = renderInMailRoot(
            <MjmlButton href="https://example.com" variant="primary">
                Primary
            </MjmlButton>,
            createTheme({ button: { backgroundColor: "#5B4FC7", variants: { primary: { color: "#FFFFFF" } } } }),
        );

        expect(html).toContain("background:#5B4FC7");
        expect(html).toContain("color:#FFFFFF");
    });

    it("applies defaultVariant when no variant prop is specified", () => {
        const { html } = renderInMailRoot(
            <MjmlButton href="https://example.com">Primary</MjmlButton>,
            createTheme({ button: { defaultVariant: "primary", variants: { primary: { backgroundColor: "#5B4FC7" } } } }),
        );

        expect(html).toContain("mjmlButton--primary");
        expect(html).toContain("background:#5B4FC7");
    });

    it("adds the full-width modifier class when fullWidth is set", () => {
        const { html } = renderInMailRoot(
            <MjmlButton href="https://example.com" fullWidth>
                Full width
            </MjmlButton>,
        );

        expect(html).toContain("mjmlButton--fullWidth");
    });

    it("leaves no full-width rule in a style block, so it survives clients that drop them", () => {
        const { html } = renderInMailRoot(
            <MjmlButton href="https://example.com" fullWidth>
                Full width
            </MjmlButton>,
        );

        expect(html).not.toMatch(/\.mjmlButton--fullWidth a\s*\{/);
    });

    it("renders an icon table passed as children without warnings", () => {
        const { html, mjmlWarnings } = renderInMailRoot(
            <MjmlButton href="https://example.com">
                <table role="presentation" cellPadding={0} cellSpacing={0} border={0}>
                    <tbody>
                        <tr>
                            <td valign="middle" style={{ paddingRight: "8px", fontSize: "0" }}>
                                <img src="https://example.com/icon.png" alt="" width={16} height={16} style={{ display: "block" }} />
                            </td>
                            <td valign="middle">Label</td>
                        </tr>
                    </tbody>
                </table>
            </MjmlButton>,
        );

        expect(mjmlWarnings).toEqual([]);
        expect(html).toContain("https://example.com/icon.png");
        expect(html).toContain("Label");
    });

    it("throws when variant is set without a ThemeProvider", () => {
        expect(() =>
            renderToStaticMarkup(
                <MjmlButton variant="primary" href="https://example.com">
                    Primary
                </MjmlButton>,
            ),
        ).toThrow();
    });
});

describe("MjmlButton styles", () => {
    it("returns empty CSS when no variants or base gradient are defined", () => {
        const theme = createTheme();
        expect(generateMjmlButtonStyles(theme)).toBe("");
    });

    it("emits a base gradient rule on the anchor when theme.button.backgroundImage is set", () => {
        const theme = createTheme({ button: { backgroundImage: "linear-gradient(to right, red, blue)" } });

        const result = generateInlineBackgroundImageCss(theme);

        expect(result).toContain(".mjmlButton a");
        expect(result).toContain("background-image: linear-gradient(to right, red, blue) !important");
    });

    it("emits a variant gradient rule targeting the variant anchor", () => {
        const theme = createTheme({
            button: { variants: { primary: { backgroundImage: "linear-gradient(to right, red, blue)" } } },
        });

        const result = generateInlineBackgroundImageCss(theme);

        expect(result).toContain(".mjmlButton--primary a");
        expect(result).toContain("background-image: linear-gradient(to right, red, blue) !important");
    });

    it("emits responsive media-query overrides for responsive variant values", () => {
        const theme = createTheme({
            button: { variants: { primary: { fontSize: { default: "13px", mobile: "16px" } } } },
        });

        const result = generateMjmlButtonStyles(theme);

        expect(result).toContain("@media");
        expect(result).toContain(".mjmlButton--primary a");
        expect(result).toContain("font-size: 16px !important");
    });
});
