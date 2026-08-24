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
});
