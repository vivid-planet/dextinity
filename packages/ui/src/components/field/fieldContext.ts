import { createContext, type ReactNode, useContext } from "react";

import type { FieldControlProps, FieldOwnerState } from "./Field";

export interface FieldContextValue {
    control: FieldControlProps;
    ownerState: FieldOwnerState;
    /** Shows the field as loading while an action at the label is running. */
    setActionPending: (pending: boolean) => void;
    /** Content shown between the control and the message, e.g. an AI suggestion to accept or discard. */
    setActionContent: (content: ReactNode) => void;
}

export const FieldContext = createContext<FieldContextValue | null>(null);

/**
 * The surrounding field's control props and state, or `null` outside a `Field`.
 */
export function useFieldContext() {
    return useContext(FieldContext);
}
