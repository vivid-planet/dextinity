import { type ReactNode, useCallback } from "react";

import type { NewToast } from "../toast/useToasts";

export interface UndoToastLabels {
    /** The toast's action. */
    undo: string;
}

const defaultLabels: UndoToastLabels = { undo: "Undo" };

export interface UndoableAction {
    /** Runs the action; called right away, without asking first. */
    run: () => void;
    /** Restores exactly the state before `run`. */
    undo: () => void;
    /** What happened, with the result and count, e.g. "“Benefits” archived" or "3 pages archived". */
    message: string;
    /** Shown after undoing, e.g. "“Benefits” restored". */
    undoneMessage?: string;
    /** Replaces the toast's icon, e.g. the action's icon. */
    icon?: ReactNode;
    /** Replaces the icon of the toast shown after undoing. */
    undoneIcon?: ReactNode;
}

export interface UndoToastOptions {
    /** `add` of the `useToasts` that feeds the page's `ToastViewport`. */
    addToast: (toast: NewToast) => string;
    /** Texts; English defaults. */
    labels?: Partial<UndoToastLabels>;
}

/**
 * Undo instead of "Are you sure?": `perform` runs an action right away and shows a toast with Undo for 8 seconds; `block` says why
 * an action could not run, e.g. "“logo.svg” is still in use · nothing deleted". Keep asking only before data is lost for good.
 */
export function useUndoToast({ addToast, labels: labelsProp }: UndoToastOptions) {
    const undoLabel = labelsProp?.undo ?? defaultLabels.undo;

    const perform = useCallback(
        ({ run, undo, message, undoneMessage, icon, undoneIcon }: UndoableAction) => {
            run();
            return addToast({
                message,
                icon,
                action: {
                    label: undoLabel,
                    onClick: () => {
                        undo();
                        if (undoneMessage != null) {
                            addToast({ message: undoneMessage, icon: undoneIcon });
                        }
                    },
                },
            });
        },
        [addToast, undoLabel],
    );

    const block = useCallback((reason: string) => addToast({ message: reason, tone: "error" }), [addToast]);

    return { perform, block };
}
