import { type ChangeEvent, useRef, useState } from "react";

/**
 * The text of an input that shows a formatted value: while the user types, the typed text, which `commit` hands over for reading once
 * typing is done (on blur or Enter); otherwise the formatted value.
 */
export function useTextDraft(formatted: string, onCommit: (text: string) => void) {
    const [draft, setDraftState] = useState<string | null>(null);
    // Blur and closing the calendar can both commit in one event; the ref lets only the first one read the text
    const draftRef = useRef<string | null>(null);
    const setDraft = (next: string | null) => {
        draftRef.current = next;
        setDraftState(next);
    };

    return {
        text: draft ?? formatted,
        onChange: (event: ChangeEvent<HTMLInputElement>) => setDraft(event.target.value),
        commit: () => {
            const text = draftRef.current;
            if (text != null) {
                setDraft(null);
                if (text !== formatted) {
                    onCommit(text);
                }
            }
        },
        reset: () => setDraft(null),
    };
}
