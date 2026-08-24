import { MjmlColumn } from "@faire/mjml-react";
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
});

function findImageTag(html: string): string {
    const imageTag = html.replace(/\s+/g, " ").match(/<img[^>]*>/);

    if (imageTag === null) {
        throw new Error("Rendered mail contains no <img> tag");
    }
    return imageTag[0];
}
