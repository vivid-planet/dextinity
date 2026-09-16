import { createContext } from "react";

import type { TipTapResolvedTextBlock, TipTapTextBlockStyle } from "./textBlocks";

interface TextBlockContextValue {
    textBlocks: TipTapResolvedTextBlock[];
    textBlockStyles: TipTapTextBlockStyle[];
}

export const TextBlockContext = createContext<TextBlockContextValue>({ textBlocks: [], textBlockStyles: [] });
