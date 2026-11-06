import { clsx } from "clsx";
import { type ReactNode, useId } from "react";

import type { FieldState } from "./Field";

function hasContent(node: ReactNode) {
    return node != null && node !== "" && node !== false;
}

/**
 * The ids and accessible connections of a group's label and its message below: the validation message while the state is `success`,
 * `warning`, or `error`, the help otherwise.
 */
export function useGroupMessage({
    state,
    validationMessage,
    helperText,
    ariaDescribedBy,
}: {
    state: FieldState;
    validationMessage: ReactNode;
    helperText: ReactNode;
    ariaDescribedBy: string | undefined;
}) {
    const id = useId();
    const labelId = `${id}label`;
    const messageId = `${id}message`;
    const message = state !== "default" && hasContent(validationMessage) ? validationMessage : helperText;
    const showsMessage = hasContent(message);
    return {
        labelId,
        messageId,
        message,
        showsMessage,
        "aria-invalid": state === "error" ? (true as const) : undefined,
        "aria-describedby": clsx(ariaDescribedBy, showsMessage && messageId) || undefined,
    };
}
