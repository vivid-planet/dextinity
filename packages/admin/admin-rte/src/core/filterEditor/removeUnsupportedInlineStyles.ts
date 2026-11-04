import type { FilterEditorStateBeforeUpdateFn, SupportedThings } from "../Rte";
import type { InlineStyleType } from "../types";
import removeInlineStyles from "./utils/removeInlineStyles";

const removeUnsupportedInlineStyles: FilterEditorStateBeforeUpdateFn = (newState, { supports }) => {
    // unstyle all core-blocks which are not supported
    const blackListInlineStyles: InlineStyleType[] = ["CODE"]; // these are not supported at all by our rte

    const supportsToInlineStyleMap: Partial<Record<SupportedThings, InlineStyleType>> = {
        bold: "BOLD",
        italic: "ITALIC",
        underline: "UNDERLINE",
        strikethrough: "STRIKETHROUGH",
        sub: "SUB",
        sup: "SUP",
    };
    const supportsToTest = Object.keys(supportsToInlineStyleMap) as SupportedThings[];
    supportsToTest.forEach((support) => {
        if (!supports.includes(support) && supportsToInlineStyleMap[support]) {
            const inlineStyle = supportsToInlineStyleMap[support];
            if (inlineStyle) {
                blackListInlineStyles.push(inlineStyle);
            }
        }
    });

    return removeInlineStyles(blackListInlineStyles)(newState);
};

export default removeUnsupportedInlineStyles;
