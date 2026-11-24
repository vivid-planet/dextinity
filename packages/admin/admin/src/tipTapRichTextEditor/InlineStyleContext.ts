import { createContext } from "react";

import type { TipTapInlineStyle } from "./options";

export const InlineStyleContext = createContext<TipTapInlineStyle[]>([]);
