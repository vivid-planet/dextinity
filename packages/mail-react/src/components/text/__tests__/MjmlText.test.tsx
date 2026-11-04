import { MjmlColumn } from "@faire/mjml-react";
import { describe, expect, it } from "vitest";

import { renderMailHtml } from "../../../server/renderMailHtml.js";
import { createTheme } from "../../../theme/createTheme.js";
import { MjmlMailRoot } from "../../mailRoot/MjmlMailRoot.js";
import { MjmlSection } from "../../section/MjmlSection.js";
import { generateMjmlTextStyles, MjmlText } from "../MjmlText.js";

describe("MjmlText integration", () => {
    // Full render pipeline: mjml2html must report no errors for this MjmlText + theme setup.
    it("produces no MJML warnings with a variant theme", () => {
        const theme = createTheme({
            text: {
                variants: {
                    heading: {
                        fontSize: { default: "32px", mobile: "24px" },
                        fontWeight: 700,
                        lineHeight: { default: "40px", mobile: "30px" },
                    },
                    body: { fontSize: "14px", lineHeight: "22px" },
                },
            },
        });

        const { mjmlWarnings } = renderMailHtml(
            <MjmlMailRoot theme={theme}>
                <MjmlSection>
                    <MjmlColumn>
                        <MjmlText variant="heading" bottomSpacing>
                            Heading
                        </MjmlText>
                        <MjmlText variant="body">Body text</MjmlText>
                        <MjmlText>Base text</MjmlText>
                    </MjmlColumn>
                </MjmlSection>
            </MjmlMailRoot>,
        );

        expect(mjmlWarnings).toEqual([]);
    });
});

describe("generateMjmlTextStyles", () => {
    it("returns empty CSS when no variants are defined", () => {
        const theme = createTheme();
        const result = generateMjmlTextStyles(theme);
        expect(result).toBe("");
    });

    it("emits style overrides with correct selector for a variant", () => {
        const theme = createTheme({
            text: {
                variants: {
                    heading: {
                        fontSize: { default: "32px", mobile: "24px" },
                    },
                },
            },
        });

        const result = generateMjmlTextStyles(theme);
        expect(result).toContain(".mjmlText--heading > div");
        expect(result).toContain("font-size: 24px !important");
    });

    it("groups multiple properties into a single media query per breakpoint", () => {
        const theme = createTheme({
            text: {
                variants: {
                    heading: {
                        fontSize: { default: "32px", mobile: "24px" },
                        lineHeight: { default: "40px", mobile: "30px" },
                    },
                },
            },
        });

        const result = generateMjmlTextStyles(theme);
        const mobileMediaQuery = `@media (max-width: ${theme.breakpoints.mobile.value - 1}px)`;
        expect(result).toContain(mobileMediaQuery);

        // Both declarations should appear within the same media query block
        const mediaBlockStart = result.indexOf(mobileMediaQuery);
        const blockContent = result.slice(mediaBlockStart);
        expect(blockContent).toContain("font-size: 24px !important");
        expect(blockContent).toContain("line-height: 30px !important");
    });

    it("uses compound selector for responsive bottomSpacing", () => {
        const theme = createTheme({
            text: {
                variants: {
                    heading: {
                        bottomSpacing: { default: "24px", mobile: "16px" },
                    },
                },
            },
        });

        const result = generateMjmlTextStyles(theme);
        expect(result).toContain(".mjmlText--bottomSpacing.mjmlText--heading");
        expect(result).toContain("padding-bottom: 16px !important");
    });

    it("emits no media queries for non-responsive variant", () => {
        const theme = createTheme({
            text: {
                variants: {
                    body: { fontSize: "14px", lineHeight: "22px" },
                },
            },
        });

        const result = generateMjmlTextStyles(theme);
        expect(result).not.toContain("@media");
    });

    it("keeps style and bottomSpacing overrides separate", () => {
        const theme = createTheme({
            text: {
                variants: {
                    heading: {
                        fontSize: { default: "32px", mobile: "24px" },
                        bottomSpacing: { default: "24px", mobile: "16px" },
                    },
                },
            },
        });

        const result = generateMjmlTextStyles(theme);

        // Style overrides use "> div" selector
        expect(result).toContain(".mjmlText--heading > div");
        expect(result).toContain("font-size: 24px !important");

        // Spacing overrides use compound selector (no "> div")
        expect(result).toContain(".mjmlText--bottomSpacing.mjmlText--heading");
        expect(result).toContain("padding-bottom: 16px !important");
    });
});
