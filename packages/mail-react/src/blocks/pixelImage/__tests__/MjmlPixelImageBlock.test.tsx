import { MjmlColumn } from "@faire/mjml-react";
import { describe, expect, it } from "vitest";

import { MjmlMailRoot } from "../../../components/mailRoot/MjmlMailRoot.js";
import { MjmlSection } from "../../../components/section/MjmlSection.js";
import { renderMailHtml } from "../../../server/renderMailHtml.js";
import { exampleBlockData } from "../__stories__/exampleBlockData.js";
import { MjmlPixelImageBlock } from "../MjmlPixelImageBlock.js";

describe("MjmlPixelImageBlock", () => {
    it("forwards borderRadius to the image", () => {
        const { html } = renderMailHtml(
            <MjmlMailRoot config={{ pixelImageBlock: { validSizes: [640, 1280], baseUrl: "" } }}>
                <MjmlSection>
                    <MjmlColumn>
                        <MjmlPixelImageBlock data={exampleBlockData} width={300} borderRadius={8} />
                    </MjmlColumn>
                </MjmlSection>
            </MjmlMailRoot>,
        );

        expect(html).toContain("border-radius:8px");
    });

    it("always has the dimensions the Outlook VML needs, without the caller giving a height", () => {
        const { html } = renderMailHtml(
            <MjmlMailRoot config={{ pixelImageBlock: { validSizes: [640, 1280], baseUrl: "" } }}>
                <MjmlSection>
                    <MjmlColumn>
                        <MjmlPixelImageBlock data={exampleBlockData} width={300} aspectRatio="3x2" borderRadius={8} />
                    </MjmlColumn>
                </MjmlSection>
            </MjmlMailRoot>,
        );

        expect(html).toMatch(/<v:roundrect[^>]*style="width:300px;height:200px;"/);
    });
});
