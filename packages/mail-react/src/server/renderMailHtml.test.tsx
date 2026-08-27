import { MjmlClass, MjmlColumn, MjmlText, MjmlTitle } from "@faire/mjml-react";
import { describe, expect, it } from "vitest";

import { MjmlMailRoot } from "../components/mailRoot/MjmlMailRoot.js";
import { MjmlSection } from "../components/section/MjmlSection.js";
import { registerStyles } from "../styles/registerStyles.js";
import { css } from "../utils/css.js";
import { renderMailHtml } from "./renderMailHtml.js";

describe("server/renderMailHtml", () => {
    it("produces HTML with a doctype", () => {
        const { html } = renderMailHtml(
            <MjmlMailRoot>
                <MjmlSection>
                    <MjmlColumn>
                        <MjmlText>Hello</MjmlText>
                    </MjmlColumn>
                </MjmlSection>
            </MjmlMailRoot>,
        );

        expect(html.toLowerCase()).toMatch(/^<!doctype html>/);
    });

    it("includes the passed-in text content", () => {
        const textContent = "Welcome to @dextinity/mail-react";

        const { html } = renderMailHtml(
            <MjmlMailRoot>
                <MjmlSection>
                    <MjmlColumn>
                        <MjmlText>{textContent}</MjmlText>
                    </MjmlColumn>
                </MjmlSection>
            </MjmlMailRoot>,
        );

        expect(html).toContain(textContent);
    });

    it("includes registered styles in the rendered HTML", () => {
        registerStyles(css`
            .myComponent {
                color: red;
            }
        `);

        const { html } = renderMailHtml(
            <MjmlMailRoot>
                <MjmlSection>
                    <MjmlColumn>
                        <MjmlText>Hello</MjmlText>
                    </MjmlColumn>
                </MjmlSection>
            </MjmlMailRoot>,
        );

        expect(html).toContain(".myComponent");
        expect(html).toContain("color: red");
    });

    it("includes function-style registered styles resolved with the theme", () => {
        registerStyles(
            (theme) => css`
                .themed {
                    width: ${theme.sizes.bodyWidth}px;
                }
            `,
        );

        const { html } = renderMailHtml(
            <MjmlMailRoot>
                <MjmlSection>
                    <MjmlColumn>
                        <MjmlText>Hello</MjmlText>
                    </MjmlColumn>
                </MjmlSection>
            </MjmlMailRoot>,
        );

        expect(html).toContain(".themed");
        expect(html).toContain("width: 600px");
    });

    it("renders the head slot content inside <mj-head>", () => {
        const titleText = "Welcome to Dextinity";
        const { html } = renderMailHtml(
            <MjmlMailRoot head={<MjmlTitle>{titleText}</MjmlTitle>}>
                <MjmlSection>
                    <MjmlColumn>
                        <MjmlText>Hello</MjmlText>
                    </MjmlColumn>
                </MjmlSection>
            </MjmlMailRoot>,
        );

        expect(html).toContain(`<title>${titleText}</title>`);
    });

    it("renders the attributes slot content inside <mj-attributes>", () => {
        const { html } = renderMailHtml(
            <MjmlMailRoot attributes={<MjmlClass name="cta" color="#FF0000" />}>
                <MjmlSection>
                    <MjmlColumn>
                        <MjmlText mjmlClass="cta">Hello</MjmlText>
                    </MjmlColumn>
                </MjmlSection>
            </MjmlMailRoot>,
        );

        expect(html).toContain("color:#FF0000");
    });

    it("produces no MJML warnings for a valid component tree", () => {
        const { mjmlWarnings } = renderMailHtml(
            <MjmlMailRoot>
                <MjmlSection>
                    <MjmlColumn>
                        <MjmlText>No warnings expected</MjmlText>
                    </MjmlColumn>
                </MjmlSection>
            </MjmlMailRoot>,
        );

        expect(mjmlWarnings).toEqual([]);
    });
});
