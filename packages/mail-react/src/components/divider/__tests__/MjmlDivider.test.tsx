import { MjmlColumn } from "@faire/mjml-react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { renderMailHtml } from "../../../server/renderMailHtml.js";
import { createTheme } from "../../../theme/createTheme.js";
import { MjmlMailRoot } from "../../mailRoot/MjmlMailRoot.js";
import { MjmlSection } from "../../section/MjmlSection.js";
import { MjmlDivider } from "../MjmlDivider.js";

describe("MjmlDivider integration", () => {
    it("produces no MJML warnings inside an MjmlMailRoot", () => {
        const theme = createTheme({
            divider: {
                variants: {
                    thin: { height: 1, backgroundColor: "#999999" },
                    thick: { height: 8, backgroundColor: "#222222" },
                },
            },
        });

        const { mjmlWarnings } = renderMailHtml(
            <MjmlMailRoot theme={theme}>
                <MjmlSection>
                    <MjmlColumn>
                        <MjmlDivider />
                        <MjmlDivider variant="thin" />
                        <MjmlDivider variant="thick" />
                    </MjmlColumn>
                </MjmlSection>
            </MjmlMailRoot>,
        );

        expect(mjmlWarnings).toEqual([]);
    });

    it("applies a variant modifier class to both mjmlDivider and htmlDivider blocks", () => {
        const theme = createTheme({
            divider: {
                variants: {
                    thick: { height: 8 },
                },
            },
        });

        const { html } = renderMailHtml(
            <MjmlMailRoot theme={theme}>
                <MjmlSection>
                    <MjmlColumn>
                        <MjmlDivider variant="thick" />
                    </MjmlColumn>
                </MjmlSection>
            </MjmlMailRoot>,
        );

        expect(html).toContain("mjmlDivider--thick");
        expect(html).toContain("htmlDivider--thick");
    });

    it("falls back to default theme values when used without a ThemeProvider", () => {
        const html = renderToStaticMarkup(<MjmlDivider />);

        expect(html).toContain("height:4px");
        expect(html).toContain("background-color:#000000");
    });

    it("throws when variant is set without a ThemeProvider", () => {
        expect(() => renderToStaticMarkup(<MjmlDivider variant="thin" />)).toThrow();
    });
});
