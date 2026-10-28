import { MjmlColumn, MjmlText } from "@faire/mjml-react";
import { describe, expect, it } from "vitest";

import type { PropsWithData } from "../../blocks/helpers/PropsWithData.js";
import { MjmlMailRoot } from "../../components/mailRoot/MjmlMailRoot.js";
import { MjmlSection } from "../../components/section/MjmlSection.js";
import { renderMailHtml } from "../../server/renderMailHtml.js";
import { withPreview } from "../withPreview.js";

const TextBlock = withPreview<PropsWithData<{ text: string; adminMeta?: { route: string } }>>(
    ({ data, className }) => (
        <MjmlSection className={className}>
            <MjmlColumn>
                <MjmlText>{data.text}</MjmlText>
            </MjmlColumn>
        </MjmlSection>
    ),
    { label: "Two List Sizes" },
);

describe("withPreview", () => {
    it("adds the admin route and label to the class names the block receives", async () => {
        const { html } = await renderMailHtml(
            <MjmlMailRoot>
                <TextBlock data={{ text: "Hello", adminMeta: { route: "/edit/blocks#text" } }} className="custom" />
            </MjmlMailRoot>,
        );

        expect(html).toContain("custom dextinity-preview-route:%2Fedit%2Fblocks%23text dextinity-preview-label:Two%20List%20Sizes");
    });

    it("leaves the mail unchanged when the block has no admin route", async () => {
        const { html } = await renderMailHtml(
            <MjmlMailRoot>
                <TextBlock data={{ text: "Hello" }} />
            </MjmlMailRoot>,
        );
        const { html: htmlWithoutPreview } = await renderMailHtml(
            <MjmlMailRoot>
                <MjmlSection>
                    <MjmlColumn>
                        <MjmlText>Hello</MjmlText>
                    </MjmlColumn>
                </MjmlSection>
            </MjmlMailRoot>,
        );

        expect(html).toBe(htmlWithoutPreview);
    });
});
