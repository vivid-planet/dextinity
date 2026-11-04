import { MjmlColumn } from "@faire/mjml-react";
import type { ComponentProps } from "react";
import { describe, expect, it } from "vitest";

import { MjmlMailRoot } from "../../../components/mailRoot/MjmlMailRoot.js";
import { MjmlSection } from "../../../components/section/MjmlSection.js";
import { renderMailHtml } from "../../../server/renderMailHtml.js";
import { MjmlImage } from "../MjmlImage.js";

describe("MjmlImage", () => {
    it("writes borderRadius into the style attribute of the compiled <img>", () => {
        const { html } = renderMailHtml(
            <MjmlMailRoot>
                <MjmlSection>
                    <MjmlColumn>
                        <MjmlImage src="image.jpg" alt="" width={100} borderRadius={8} />
                    </MjmlColumn>
                </MjmlSection>
            </MjmlMailRoot>,
        );

        expect(findImageTag(html)).toContain("border-radius:8px");
    });

    it("gives classic Outlook a VML shape and hides the image from it", () => {
        const html = renderRoundedImage({ width: 536, height: 301 });

        expect(html).toMatch(/<!--\[if mso\]><tr><td[^>]*style="padding:0;font-size:0"[^>]*><v:roundrect/);
        expect(html).toContain('<!--[if !mso]><!--><tr><td align="center" class="mjmlImage"');
        expect(html).toContain("<!--<![endif]-->");
    });

    it("keeps the image clickable in Outlook, where the surrounding link is hidden", () => {
        const html = renderRoundedImage({ width: 536, height: 301, href: "https://example.com" });

        expect(html).toMatch(/<v:roundrect[^>]*href="https:\/\/example.com"/);
    });

    it("leaves the markup untouched when the height is unknown", () => {
        const html = renderRoundedImage({ width: 536 });

        expect(html).not.toContain("v:roundrect");
        expect(html).not.toContain("<!--[if !mso]><!-->");
    });
});

/** Returns the rendered `<body>`, so assertions can't match MJML's own conditional comments in the `<head>`. */
function renderRoundedImage(imageProps: Partial<ComponentProps<typeof MjmlImage>>): string {
    const { html } = renderMailHtml(
        <MjmlMailRoot>
            <MjmlSection>
                <MjmlColumn>
                    <MjmlImage src="image.jpg" alt="A photo" borderRadius={16} {...imageProps} />
                </MjmlColumn>
            </MjmlSection>
        </MjmlMailRoot>,
    );

    return html.slice(html.indexOf("<body")).replace(/\s+/g, " ");
}

function findImageTag(html: string): string {
    const imageTag = html.replace(/\s+/g, " ").match(/<img[^>]*>/);

    if (imageTag === null) {
        throw new Error("Rendered mail contains no <img> tag");
    }
    return imageTag[0];
}
