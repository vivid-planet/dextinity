import { describe, expect, it } from "vitest";

import { createTheme } from "../../../theme/createTheme.js";
import { generateRichTextListStyles } from "../RichTextList.js";

describe("generateRichTextListStyles", () => {
    it("restates a variant's breakpoint overrides on both cells, and its bottom spacing on the last row", () => {
        const theme = createTheme({
            text: {
                variants: { body: { fontSize: { default: "16px", mobile: "14px" }, bottomSpacing: { default: "16px", mobile: "12px" } } },
            },
        });
        const styles = generateRichTextListStyles(theme);

        expect(styles).toContain(".richTextBlock__list--variantBody .richTextBlock__listItemMarker");
        expect(styles).toContain(".richTextBlock__list--variantBody .richTextBlock__listItemText");
        expect(styles).toContain("font-size: 14px !important");
        expect(styles).toContain(".richTextBlock__list--variantBody .richTextBlock__listItem--blockSpacing > td");
        expect(styles).toContain("padding-bottom: 12px !important");
    });

    it("restates the breakpoint values of the list spacing tokens on the cells they pad", () => {
        const theme = createTheme({
            list: {
                indent: { default: 40, mobile: 12 },
                markerGap: { default: 24, mobile: 6 },
                itemSpacing: { default: 20, mobile: 4 },
            },
        });
        const styles = generateRichTextListStyles(theme);

        expect(styles).toContain(theme.breakpoints.mobile.belowMediaQuery);
        expect(styles).toContain(".richTextBlock__listItemMarker");
        expect(styles).toContain("padding-left: 12px !important");
        expect(styles).toContain("padding-right: 6px !important");
        expect(styles).toContain(".richTextBlock__listItem--itemSpacing > td");
        expect(styles).toContain("padding-bottom: 4px !important");
        expect(styles).toContain(".richTextBlock__listItem--itemSpacingAbove > td");
        expect(styles).toContain("padding-top: 4px !important");
    });
});
