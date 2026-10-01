import { createContext } from "react";

import type { TipTapResolvedList, TipTapResolvedTextBlock } from "./textBlocks";

interface TextBlockContextValue {
    textBlocks: TipTapResolvedTextBlock[];
    orderedList: false | TipTapResolvedList;
    unorderedList: false | TipTapResolvedList;
}

export const TextBlockContext = createContext<TextBlockContextValue>({ textBlocks: [], orderedList: false, unorderedList: false });
