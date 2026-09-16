import { createContext } from "react";

import type { TipTapResolvedTextBlock, TipTapTextBlockStyle } from "./textBlocks";

interface TextBlockContextValue {
    textBlocks: TipTapResolvedTextBlock[];
    /**
     * The styles of all text blocks and lists, deduplicated by name, so a node's `textBlockStyle`
     * can be rendered wherever it is used.
     */
    textBlockStyles: TipTapTextBlockStyle[];
}

export const TextBlockContext = createContext<TextBlockContextValue>({ textBlocks: [], textBlockStyles: [] });
