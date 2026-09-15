import { createContext } from "react";

import type { TipTapTextBlockStyle } from "./createTipTapRichTextBlock";
import type { TipTapResolvedTextBlock } from "./textBlocks";

interface TextBlockContextValue {
    textBlocks: TipTapResolvedTextBlock[];
    textBlockStyles: TipTapTextBlockStyle[];
}

export const TextBlockContext = createContext<TextBlockContextValue>({ textBlocks: [], textBlockStyles: [] });
