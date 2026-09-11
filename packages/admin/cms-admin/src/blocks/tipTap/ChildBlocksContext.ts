import { createContext } from "react";

import type { BlockInterface } from "../types";

export const ChildBlocksContext = createContext<Record<string, BlockInterface>>({});
