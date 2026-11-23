import { useSyncExternalStore } from "react";

/** Where a note sits: the prototype, its page, and the element's path in the page. */
export interface NoteAnchor {
    prototypeId: string;
    page: string;
    path: number[];
}

export interface PinnedComment extends NoteAnchor {
    id: string;
    text: string;
    /** Where on the element the pin sits, as a share of its width and height. */
    x: number;
    y: number;
    resolved?: boolean;
}

export interface TextChange extends NoteAnchor {
    id: string;
    original: string;
    text: string;
}

/** A list kept in the browser's storage and shared by everything in the workspace that shows it, including other tabs. */
function createStoredList<Item>(storageKey: string) {
    const listeners = new Set<() => void>();
    let cache: Item[] | null = null;

    function get(): Item[] {
        if (cache === null) {
            try {
                const stored: unknown = JSON.parse(localStorage.getItem(storageKey) ?? "[]");
                cache = Array.isArray(stored) ? (stored as Item[]) : [];
            } catch {
                cache = [];
            }
        }
        return cache;
    }

    function set(items: Item[]) {
        cache = items;
        try {
            localStorage.setItem(storageKey, JSON.stringify(items));
        } catch {
            // Without storage, the notes last until the page reloads
        }
        listeners.forEach((listener) => listener());
    }

    function subscribe(listener: () => void) {
        const handleStorage = (event: StorageEvent) => {
            if (event.key === storageKey) {
                cache = null;
                listener();
            }
        };
        listeners.add(listener);
        window.addEventListener("storage", handleStorage);
        return () => {
            listeners.delete(listener);
            window.removeEventListener("storage", handleStorage);
        };
    }

    return {
        get,
        set,
        update: (change: (items: Item[]) => Item[]) => set(change(get())),
        useItems: () => useSyncExternalStore(subscribe, get),
    };
}

export const commentList = createStoredList<PinnedComment>("dextinity-ui-workspace-comments");
export const textChangeList = createStoredList<TextChange>("dextinity-ui-workspace-text-changes");

export function createNoteId() {
    return crypto.randomUUID();
}

export function isOnPage(note: NoteAnchor, prototypeId: string, page: string) {
    return note.prototypeId === prototypeId && note.page === page;
}
