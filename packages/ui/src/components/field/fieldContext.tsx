import { createContext, type ReactNode, useContext } from "react";

import type { FieldControlProps, FieldOwnerState } from "./Field";

export interface FieldContextValue {
    control: FieldControlProps;
    ownerState: FieldOwnerState;
    /** Shows the field as loading while an action at the label is running. */
    setActionPending: (pending: boolean) => void;
    /** Content shown between the control and the message, e.g. a translation to accept or discard. */
    setActionContent: (content: ReactNode) => void;
}

export const FieldContext = createContext<FieldContextValue | null>(null);

/**
 * The surrounding field's control props and state, or `null` outside a `Field`.
 */
export function useFieldContext() {
    return useContext(FieldContext);
}

/**
 * Hides the surrounding field from portaled content. React context passes through portals, so without it an `Input` in a popup
 * opened from inside a `Field` would take over that field's id, label, message and state.
 */
export function FieldContextReset({ children }: { children?: ReactNode }) {
    return <FieldContext.Provider value={null}>{children}</FieldContext.Provider>;
}
