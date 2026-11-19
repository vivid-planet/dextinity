import { type ChangeEvent, useEffect, useRef, useState } from "react";

/**
 * Why typed text can't be used, or how to use it.
 */
export type TextReading = { error: string } | { apply: () => void };

/**
 * The text of an input that shows a formatted value: while the user types, the typed text, which `commit` hands over to `read` once
 * typing is done (on blur or Enter); otherwise the formatted value. Text that can't be used stays, with the reason as `error`, until the
 * user changes it, resets it, or the value changes. `rereadRejectedText` reads it again, so it is used once the rules allow it.
 */
export function useTextDraft(formatted: string, read: (text: string) => TextReading) {
    const [draft, setDraftState] = useState<string | null>(null);
    const [error, setError] = useState<string>();
    const [shownFormatted, setShownFormatted] = useState(formatted);
    // Blur and closing the calendar can both commit in one event; the ref lets only the first one read the text
    const draftRef = useRef<string | null>(null);
    const setDraft = (next: string | null) => {
        draftRef.current = next;
        setDraftState(next);
    };

    if (formatted !== shownFormatted) {
        // A new value from outside, e.g. a form reset, replaces text that couldn't be used
        setShownFormatted(formatted);
        draftRef.current = null;
        setDraftState(null);
        setError(undefined);
    }

    return {
        text: draft ?? formatted,
        error,
        onChange: (event: ChangeEvent<HTMLInputElement>) => {
            setDraft(event.target.value);
            setError(undefined);
        },
        commit: () => {
            const text = draftRef.current;
            if (text == null) {
                return;
            }
            if (text !== formatted) {
                const reading = read(text);
                if ("error" in reading) {
                    // Keeps the text so it can be corrected; the next commit reads it again only once it changed
                    draftRef.current = null;
                    setError(reading.error);
                    return;
                }
                reading.apply();
            }
            setDraft(null);
        },
        reset: () => {
            setDraft(null);
            setError(undefined);
        },
        /** Reads the rejected text again and uses it if the rules allow it now. Returns whether it was used. */
        rereadRejectedText: () => {
            if (draft == null || error == null) {
                return false;
            }
            const reading = read(draft);
            if ("error" in reading) {
                if (reading.error !== error) {
                    setError(reading.error);
                }
                return false;
            }
            setDraft(null);
            setError(undefined);
            reading.apply();
            return true;
        },
    };
}

/**
 * After each render, reads the rejected text of the drafts again, in order, and stops at the first draft that uses it, as using it also
 * changes what the later drafts read. Calls `onNoRejectedTextUsed` when no draft uses its text.
 */
export function useRejectedTextReread(drafts: Array<{ rereadRejectedText: () => boolean }>, onNoRejectedTextUsed?: () => void) {
    useEffect(() => {
        const isRejectedTextUsed = drafts.some((draft) => draft.rereadRejectedText());
        if (!isRejectedTextUsed) {
            onNoRejectedTextUsed?.();
        }
    });
}
