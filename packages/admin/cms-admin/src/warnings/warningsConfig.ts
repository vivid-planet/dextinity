import type { ReactNode } from "react";

import { useDextinityConfig } from "../config/DextinityConfigContext";
import { warningMessages as baseWarningMessages } from "./warningMessages";

export interface WarningsConfig {
    messages: Record<string, ReactNode>;
}

export function useWarningsConfig(): WarningsConfig {
    const dextinityConfig = useDextinityConfig();

    return { ...dextinityConfig.warnings, messages: { ...dextinityConfig.warnings?.messages, ...baseWarningMessages } };
}
