import { useEffect, useMemo } from "react";

type TextSelection = {
    text: string;
    /** The text is cut off after `maxTextSelectionLength` characters. */
    isTruncated: boolean;
};

// Enough for the few sentences a request like "improve this text" is about, without letting a select-all of
// the whole page land in the agent's context with every push.
const maxTextSelectionLength = 2000;

const chatSelector = "ai-hub-chat";

const isInChat = (node: Node | null) => {
    const element = node instanceof Element ? node : node?.parentElement;
    return element?.closest(chatSelector) != null;
};

const readSelectedText = (document: Document) => {
    const activeElement = document.activeElement;
    // The selection of a text field isn't part of the document's selection.
    if (activeElement instanceof HTMLInputElement || activeElement instanceof HTMLTextAreaElement) {
        const { selectionStart, selectionEnd, value } = activeElement;
        return selectionStart != null && selectionEnd != null ? value.slice(selectionStart, selectionEnd) : "";
    }

    return document.getSelection()?.toString() ?? "";
};

const readTextSelection = (document: Document): TextSelection | null => {
    const text = readSelectedText(document);
    if (text.trim() === "") {
        return null;
    }

    return { text: text.slice(0, maxTextSelectionLength), isTruncated: text.length > maxTextSelectionLength };
};

// A subscribable store instead of state: the selection changes with every mouse move while the user drags it.
type TextSelectionStore = {
    getCurrent: () => TextSelection | null;
    update: () => void;
    /** Forgets the selection, e.g. once the text it was taken from has been replaced. */
    clear: () => void;
    subscribe: (listener: () => void) => () => void;
};

const createTextSelectionStore = (document: Document): TextSelectionStore => {
    let current: TextSelection | null = null;
    const listeners = new Set<() => void>();

    const set = (next: TextSelection | null) => {
        if (next?.text === current?.text && next?.isTruncated === current?.isTruncated) {
            return;
        }

        current = next;
        for (const listener of listeners) {
            listener();
        }
    };

    return {
        getCurrent: () => current,
        update: () => {
            // Focusing the chat to ask about the selection moves the document's selection away from it, and
            // selecting text in the chat isn't selecting text in the admin. Keep the selection in both cases.
            if (isInChat(document.activeElement) || isInChat(document.getSelection()?.anchorNode ?? null)) {
                return;
            }

            set(readTextSelection(document));
        },
        clear: () => set(null),
        subscribe: (listener) => {
            listeners.add(listener);
            return () => {
                listeners.delete(listener);
            };
        },
    };
};

/** Tracks the text the user has selected in the admin, in a text field or anywhere else on the page. */
export function useTextSelectionStore() {
    const store = useMemo(() => createTextSelectionStore(document), []);

    useEffect(() => {
        // Fired at the document for the page's selection, and bubbles up to it from a text field.
        document.addEventListener("selectionchange", store.update);
        return () => {
            document.removeEventListener("selectionchange", store.update);
        };
    }, [store]);

    return store;
}
