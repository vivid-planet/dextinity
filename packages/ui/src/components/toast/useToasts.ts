import { type ReactNode, useCallback, useRef, useState } from "react";

import type { ToastAction, ToastTone } from "./Toast";

export interface ToastData {
    /** Identifies the toast, e.g. to dismiss it. */
    id: string;
    /** The result of the action, e.g. "Saved – the change is live". */
    message: string;
    /**
     * Sets the icon and its color: `success` confirms, `error` reports a failure, `warning` points out something to look at although
     * the action went through, `info` informs.
     *
     * @defaultValue `"success"`
     */
    tone?: ToastTone;
    /** Replaces the tone's icon. */
    icon?: ReactNode;
    /** One action, usually "Undo". */
    action?: ToastAction;
    /**
     * Milliseconds until the toast dismisses itself.
     *
     * @defaultValue `5000`, or `8000` with an `action`
     */
    duration?: number;
}

export type NewToast = Omit<ToastData, "id">;

/**
 * Holds the toasts of one `ToastViewport`. `add` shows a toast in place of the current one, since one toast at a time
 * keeps the latest result readable, and returns its id; `dismiss` removes a toast.
 */
export function useToasts() {
    const [toasts, setToasts] = useState<ToastData[]>([]);
    const nextIdRef = useRef(0);

    const add = useCallback((toast: NewToast) => {
        nextIdRef.current += 1;
        const id = `toast-${nextIdRef.current}`;
        setToasts([{ ...toast, id }]);
        return id;
    }, []);

    const dismiss = useCallback((id: string) => {
        setToasts((current) => current.filter((toast) => toast.id !== id));
    }, []);

    return { toasts, add, dismiss };
}
