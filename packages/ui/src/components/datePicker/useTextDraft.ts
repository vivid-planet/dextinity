import { type ChangeEvent, useRef, useState } from "react";

/**
 * The text of an input that shows a formatted value: while the user types, the typed text, which `commit` hands over for reading once
 * typing is done (on blur or Enter); otherwise the formatted value. When `onCommit` returns a message, the text can't be used: it stays,
 * with the message as `error`, until the user changes it, resets it, or the value changes.
 */
export function useTextDraft(formatted: string, onCommit: (text: string) => string | undefined | void) {
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
            const message = text !== formatted ? onCommit(text) : undefined;
            if (message != null) {
                // Keeps the text so it can be corrected; the next commit reads it again only once it changed
                draftRef.current = null;
                setError(message);
                return;
            }
            setDraft(null);
        },
        reset: () => {
            setDraft(null);
            setError(undefined);
        },
    };
}
