import type { BlockState, TipTapRichTextBlockContent } from "@dextinity/cms-admin";

import type { PriceCellBlock } from "./PriceCellBlock";
import type { TextCellBlock } from "./TextCellBlock";

type TextCellState = BlockState<typeof TextCellBlock>;
type PriceCellState = BlockState<typeof PriceCellBlock>;

const getPlainText = (content: TipTapRichTextBlockContent): string => content.text ?? (content.content ?? []).map(getPlainText).join(" ");

export const convertTextToPriceCell = ({ text, badges }: TextCellState): PriceCellState | null => {
    const plainText = getPlainText(text.tipTapContent).trim();

    // Only accepts a dot as the decimal separator, because "1.299" means 1299 in some locales
    if (!/^-?\d+(\.\d+)?$/.test(plainText)) {
        return null;
    }

    return { amount: Number(plainText), bold: false, badges };
};

export const convertPriceToTextCell = ({ amount, badges }: PriceCellState): TextCellState | null => {
    if (amount == null) {
        return null;
    }

    return {
        text: {
            tipTapContent: {
                type: "doc",
                content: [
                    {
                        type: "textBlock",
                        attrs: { textBlock: "paragraph", textBlockStyle: "paragraph300" },
                        content: [{ type: "text", text: String(amount) }],
                    },
                ],
            },
        },
        badges,
    };
};
