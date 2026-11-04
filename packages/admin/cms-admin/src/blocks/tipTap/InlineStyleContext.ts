import { createContext } from "react";

import type { TipTapInlineStyle } from "./createTipTapRichTextBlock";

export const InlineStyleContext = createContext<TipTapInlineStyle[]>([]);
