import { fileURLToPath } from "node:url";

import { MjmlClass, MjmlColumn, MjmlInclude, MjmlText, MjmlTitle } from "@faire/mjml-react";
import { describe, expect, it } from "vitest";

import { MjmlMailRoot } from "../components/mailRoot/MjmlMailRoot.js";
import { MjmlSection } from "../components/section/MjmlSection.js";
import { registerStyles } from "../styles/registerStyles.js";
import { css } from "../utils/css.js";
import { renderMailHtml } from "./renderMailHtml.js";

describe("server/renderMailHtml", () => {
    it("produces HTML with a doctype", async () => {
        const { html } = await renderMailHtml(
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

    it("includes the passed-in text content", async () => {
        const textContent = "Welcome to @dextinity/mail-react";

        const { html } = await renderMailHtml(
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

    it("includes registered styles in the rendered HTML", async () => {
        registerStyles(css`
            .myComponent {
                color: red;
            }
        `);

        const { html } = await renderMailHtml(
            <MjmlMailRoot>
                <MjmlSection>
                    <MjmlColumn>
                        <MjmlText>Hello</MjmlText>
                    </MjmlColumn>
                </MjmlSection>
            </MjmlMailRoot>,
        );

        expect(html).toContain(".myComponent");
        expect(html).toContain("color:red");
    });

    it("includes function-style registered styles resolved with the theme", async () => {
        registerStyles(
            (theme) => css`
                .themed {
                    width: ${theme.sizes.bodyWidth}px;
                }
            `,
        );

        const { html } = await renderMailHtml(
            <MjmlMailRoot>
                <MjmlSection>
                    <MjmlColumn>
                        <MjmlText>Hello</MjmlText>
                    </MjmlColumn>
                </MjmlSection>
            </MjmlMailRoot>,
        );

        expect(html).toContain(".themed");
        expect(html).toContain("width:600px");
    });

    it("minifies the registered styles", async () => {
        registerStyles(css`
            .minifyMe {
                color: red;
                padding-bottom: 8px;
            }
        `);

        const { html } = await renderMailHtml(
            <MjmlMailRoot>
                <MjmlSection>
                    <MjmlColumn>
                        <MjmlText>Hello</MjmlText>
                    </MjmlColumn>
                </MjmlSection>
            </MjmlMailRoot>,
        );

        expect(html).toContain(".minifyMe");
        expect(html).toContain("color:red;padding-bottom:8px");
    });

    it("writes no two closing braces in a row, which Outlook cuts the head CSS at", async () => {
        registerStyles(css`
            @media (max-width: 479px) {
                .firstMediaBlock {
                    color: red;
                }
            }
            @media (max-width: 599px) {
                .secondMediaBlock {
                    color: green;
                }
            }
        `);

        const { html } = await renderMailHtml(
            <MjmlMailRoot>
                <MjmlSection>
                    <MjmlColumn>
                        <MjmlText>Hello</MjmlText>
                    </MjmlColumn>
                </MjmlSection>
            </MjmlMailRoot>,
        );

        expect(html).not.toContain("}}");
        expect(html).toContain(".secondMediaBlock{color:green}");
    });

    it("keeps the Outlook properties that MJML writes", async () => {
        const { html } = await renderMailHtml(
            <MjmlMailRoot>
                <MjmlSection>
                    <MjmlColumn>
                        <MjmlText>Hello</MjmlText>
                    </MjmlColumn>
                </MjmlSection>
            </MjmlMailRoot>,
        );

        // A minifier would write `0pt` as `0`, which Outlook does not read.
        expect(html).toContain("mso-table-lspace:0pt");
    });

    it("renders the head slot content inside <mj-head>", async () => {
        const titleText = "Welcome to Dextinity";
        const { html } = await renderMailHtml(
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

    it("renders the attributes slot content inside <mj-attributes>", async () => {
        const { html } = await renderMailHtml(
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

    it("produces no MJML warnings for a valid component tree", async () => {
        const { mjmlWarnings } = await renderMailHtml(
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

    // MJML only includes files by a relative path inside the directory of the `filePath` option.
    const fixturesDirectory = fileURLToPath(new URL("./__fixtures__", import.meta.url));

    const mailWithIncludedFile = (
        <MjmlMailRoot>
            <MjmlSection>
                <MjmlColumn>
                    <MjmlInclude path="./included.mjml" />
                </MjmlColumn>
            </MjmlSection>
        </MjmlMailRoot>
    );

    it.each([
        { case: "without ignoreIncludes", options: { filePath: fixturesDirectory } },
        { case: "with ignoreIncludes set to undefined", options: { filePath: fixturesDirectory, ignoreIncludes: undefined } },
    ])("does not read files from the server through mj-include $case", async ({ options }) => {
        const { html } = await renderMailHtml(mailWithIncludedFile, options);

        expect(html).not.toContain("content-of-a-server-file");
    });

    it("reads files through mj-include when ignoreIncludes is false", async () => {
        const { html } = await renderMailHtml(mailWithIncludedFile, { filePath: fixturesDirectory, ignoreIncludes: false });

        expect(html).toContain("content-of-a-server-file");
    });
});
