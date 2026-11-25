import type { ReactNode } from "react";
import type { MessageDescriptor } from "react-intl";

import { useDextinityConfig } from "../config/DextinityConfigContext";
import { warningMessages as baseWarningMessages } from "./warningMessages";

export interface WarningsConfig {
    messages: Record<string, ReactNode>;
    /**
     * Plain-text labels for messages whose text can't be read from `messages`, for instance because a component renders it.
     * They are used for the filter options and the search. Messages without a label here use the text of their `messages` entry.
     */
    messageLabels?: Record<string, string | MessageDescriptor>;
}

export function useWarningsConfig(): WarningsConfig {
    const dextinityConfig = useDextinityConfig();

    return { ...dextinityConfig.warnings, messages: { ...dextinityConfig.warnings?.messages, ...baseWarningMessages } };
}
