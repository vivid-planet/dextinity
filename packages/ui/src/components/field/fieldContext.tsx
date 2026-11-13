import { createContext, type ReactNode, useContext } from "react";

import type { FieldControlProps, FieldOwnerState } from "./Field";

/**
 * What a control inside a `Field` reports to the field to show.
 */
export interface ControlReport {
    /** An error the control found itself, e.g. typed text that is no valid date. Shown in place of the field's message, as an error. */
    error?: string;
    /** Shown at the end of the label row, e.g. a character count. */
    counter?: string;
    /** Shows the field as loading, e.g. while the control creates an option. */
    pending?: boolean;
}

export interface FieldContextValue {
    control: FieldControlProps;
    ownerState: FieldOwnerState;
    /** Shows the field as loading while an action at the label is running. */
    setActionPending: (pending: boolean) => void;
    /** Content shown between the control and the message, e.g. a translation to accept or discard. */
    setActionContent: (content: ReactNode) => void;
    /** Lets the control show its own error, counter, or loading state in the field. */
    setControlReport: (report: ControlReport) => void;
    /**
     * The id of a hidden "Required" text in a required field. A control whose role has no `aria-required`, e.g. `role="group"` or a
     * button, adds it to its `aria-describedby` instead.
     */
    requiredDescriptionId: string | undefined;
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
