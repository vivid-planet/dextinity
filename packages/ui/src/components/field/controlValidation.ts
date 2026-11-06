import { clsx } from "clsx";
import { type ReactNode, useId } from "react";

import type { FieldState } from "./Field";

/**
 * Validation props of the controls without a field frame, e.g. `Checkbox`, `Switch`, and `Slider`.
 */
export interface ControlValidationProps {
    /** Message for the `state`, shown below the control while the state is `success`, `warning`, or `error`. Say what is missing and how to fix it. */
    validationMessage?: ReactNode;
    /**
     * Validation state, shown by the message color.
     *
     * @defaultValue `"default"`
     */
    state?: FieldState;
}

function hasValidationMessage(state: FieldState, validationMessage: ReactNode) {
    return state !== "default" && validationMessage != null && validationMessage !== "" && validationMessage !== false;
}

export function useControlValidation(state: FieldState, validationMessage: ReactNode, ariaDescribedBy: string | undefined) {
    const messageId = `${useId()}message`;
    const showsMessage = hasValidationMessage(state, validationMessage);
    return {
        messageId,
        showsMessage,
        "aria-invalid": state === "error" ? (true as const) : undefined,
        "aria-describedby": clsx(ariaDescribedBy, showsMessage && messageId) || undefined,
    };
}
