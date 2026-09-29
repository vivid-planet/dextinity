import { MjmlColumn } from "@faire/mjml-react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { renderMailHtml } from "../../../server/renderMailHtml.js";
import { createTheme } from "../../../theme/createTheme.js";
import { ThemeProvider } from "../../../theme/ThemeProvider.js";
import { MjmlMailRoot } from "../../mailRoot/MjmlMailRoot.js";
import { MjmlSection } from "../../section/MjmlSection.js";
import { HtmlText } from "../../text/HtmlText.js";
import { MjmlText } from "../../text/MjmlText.js";
import { HtmlInlineLink } from "../HtmlInlineLink.js";

function getInlineLinkColor(html: string): string | undefined {
    const style = /<a[^>]*\sstyle="([^"]*)"/.exec(html)?.[1];

    if (style === undefined) {
        throw new Error(`Rendered markup contains no styled anchor: ${html}`);
    }

    const colorDeclaration = style
        .split(";")
        .map((declaration) => declaration.trim())
        .find((declaration) => declaration.startsWith("color:"));

    return colorDeclaration?.slice("color:".length).trim();
}

// Outlook's Word renderer discards `inherit`, so a theme that sets no color of its own must still
// leave the anchor with a color that renderer can resolve.
describe("HtmlInlineLink", () => {
    it("writes a resolvable color inside HtmlText", () => {
        const html = renderToStaticMarkup(
            <ThemeProvider theme={createTheme()}>
                <HtmlText element="div">
                    Visit <HtmlInlineLink href="https://example.com">our website</HtmlInlineLink>
                </HtmlText>
            </ThemeProvider>,
        );

        const color = getInlineLinkColor(html);

        expect(color).toBeDefined();
        expect(color).not.toBe("inherit");
    });

    it("writes a resolvable color inside MjmlText", () => {
        const { html } = renderMailHtml(
            <MjmlMailRoot theme={createTheme()}>
                <MjmlSection>
                    <MjmlColumn>
                        <MjmlText>
                            Visit <HtmlInlineLink href="https://example.com">our website</HtmlInlineLink>
                        </MjmlText>
                    </MjmlColumn>
                </MjmlSection>
            </MjmlMailRoot>,
        );

        const color = getInlineLinkColor(html);

        expect(color).toBeDefined();
        expect(color).not.toBe("inherit");
    });
});
