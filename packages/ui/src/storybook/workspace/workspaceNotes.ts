import { useSyncExternalStore } from "react";

/** Where a note sits: the prototype, its page, and the element's path in the page. */
export interface NoteAnchor {
    prototypeId: string;
    page: string;
    path: number[];
}

/** The view a note was written in, so that whoever reads it can see the page the same way. */
export interface NoteViewSettings {
    brand: string;
    colorScheme: string;
    density: string;
    textLength: string;
    /** The content scenario of the View menu, e.g. `many` or `empty`. */
    content: string;
    /** The size of the frame's window in CSS pixels, which its media queries see. */
    viewportWidth: number;
    viewportHeight: number;
}

/** Where a designer note was shared to, through the page that hosts the Workbench. */
export type NoteShareTarget = "comment" | "claude";

/**
 * A designer note pinned to an element of a prototype's page. The optional fields came after the first stored notes, which lack them.
 */
export interface DesignerNote extends NoteAnchor {
    id: string;
    text: string;
    /** Where on the element the pin sits, as a share of its width and height. */
    x: number;
    y: number;
    /** Done; stored under the name the notes had when they were called comments. */
    resolved?: boolean;
    /** A short description of the element, e.g. `button “Save”`. */
    element?: string;
    view?: NoteViewSettings;
    /** ISO date and time. */
    createdAt?: string;
    /** ISO date and time of the last successful share. */
    sharedAt?: string;
    sharedAs?: NoteShareTarget;
}

export interface TextChange extends NoteAnchor {
    id: string;
    original: string;
    text: string;
    /** A short description of the element, e.g. `heading “Job ads”`. */
    element?: string;
    /** Whether the change goes into the code request; changes stored before the toggle existed are left out. */
    inCodeRequest?: boolean;
    /** ISO date and time. */
    createdAt?: string;
}

/** A list kept in the browser's storage and shared by everything in the workspace that shows it, including other tabs. */
export function createStoredList<Item>(storageKey: string) {
    const listeners = new Set<() => void>();
    let cache: Item[] | null = null;
    // Another window changed the list; read again even when nothing here shows it, e.g. a frame that only reads it on a click
    window.addEventListener("storage", (event) => {
        if (event.key === storageKey) {
            cache = null;
        }
    });

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

// The key of the notes from when they were called comments, so that the stored ones stay
export const designerNoteList = createStoredList<DesignerNote>("dextinity-ui-workspace-comments");
export const textChangeList = createStoredList<TextChange>("dextinity-ui-workspace-text-changes");

export function createNoteId() {
    return crypto.randomUUID();
}

export function isOnPage(note: NoteAnchor, prototypeId: string, page: string) {
    return note.prototypeId === prototypeId && note.page === page;
}

export function isNoteDone(note: DesignerNote) {
    return note.resolved === true;
}

export function isInCodeRequest(change: TextChange) {
    return change.inCodeRequest === true;
}
