import type { ReactNode } from "react";

import type { FieldAdapterConfig, FieldMessageTiming } from "../fieldAdapterConfig/FieldAdapterConfigProvider";

export interface FieldValidationProps {
    state?: "error" | "warning";
    validationMessage?: ReactNode;
}

interface FieldValidationInput {
    hasError: boolean;
    error: ReactNode;
    warning: ReactNode;
    touchedOrSubmitted: boolean;
    config: FieldAdapterConfig;
}

function isShown(timing: FieldMessageTiming, touchedOrSubmitted: boolean) {
    return timing === "always" || touchedOrSubmitted;
}

function hasContent(message: ReactNode) {
    return message != null && message !== "" && message !== false;
}

export function fieldValidationProps({ hasError, error, warning, touchedOrSubmitted, config }: FieldValidationInput): FieldValidationProps {
    if (hasError && isShown(config.showErrors, touchedOrSubmitted)) {
        return { state: "error", validationMessage: error };
    }
    if (hasContent(warning) && isShown(config.showWarnings, touchedOrSubmitted)) {
        return { state: "warning", validationMessage: warning };
    }
    return {};
}
