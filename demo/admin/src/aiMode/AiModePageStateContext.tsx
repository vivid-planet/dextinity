import { createContext, type PropsWithChildren, useCallback, useContext, useEffect, useMemo, useRef } from "react";

export type AiModePageStateMetadata = {
    pageTreeNodeId: string;
    documentType: string;
    documentId?: string;
    path: string;
    activeTab?: string;
    selectedBlockRoute?: string;
    hasChanges: boolean;
};

export type AiModePageState = {
    metadata: AiModePageStateMetadata;
    getDocumentSummary: () => Record<string, unknown>;
};

// A subscribable store instead of context state: block editing updates the edit page on every
// keystroke, and re-rendering the whole app (or the flyout) for each of those would be wasteful.
type AiModePageStateStore = {
    getCurrent: () => AiModePageState | null;
    set: (pageState: AiModePageState | null) => void;
    subscribe: (listener: () => void) => () => void;
};

const createAiModePageStateStore = (): AiModePageStateStore => {
    let current: AiModePageState | null = null;
    const listeners = new Set<() => void>();

    return {
        getCurrent: () => current,
        set: (pageState) => {
            current = pageState;
            for (const listener of listeners) {
                listener();
            }
        },
        subscribe: (listener) => {
            listeners.add(listener);
            return () => {
                listeners.delete(listener);
            };
        },
    };
};

const AiModePageStateContext = createContext<AiModePageStateStore>(createAiModePageStateStore());

export function AiModePageStateProvider({ children }: PropsWithChildren) {
    const store = useMemo(createAiModePageStateStore, []);

    return <AiModePageStateContext.Provider value={store}>{children}</AiModePageStateContext.Provider>;
}

export function useAiModePageStateStore() {
    return useContext(AiModePageStateContext);
}

export function useRegisterAiModePageState(pageState: AiModePageState | null) {
    const store = useAiModePageStateStore();

    // Read via a ref so the store update effect doesn't depend on the callback's identity,
    // which changes on every render of the registering page.
    const getDocumentSummaryRef = useRef(pageState?.getDocumentSummary);
    getDocumentSummaryRef.current = pageState?.getDocumentSummary;
    const getDocumentSummary = useCallback(() => getDocumentSummaryRef.current?.() ?? {}, []);

    const { pageTreeNodeId, documentType, documentId, path, activeTab, selectedBlockRoute, hasChanges } = pageState?.metadata ?? {};

    useEffect(() => {
        if (pageTreeNodeId == null || documentType == null || path == null || hasChanges == null) {
            store.set(null);
            return;
        }

        store.set({
            metadata: { pageTreeNodeId, documentType, documentId, path, activeTab, selectedBlockRoute, hasChanges },
            getDocumentSummary,
        });
    }, [store, pageTreeNodeId, documentType, documentId, path, activeTab, selectedBlockRoute, hasChanges, getDocumentSummary]);

    useEffect(() => {
        return () => {
            store.set(null);
        };
    }, [store]);
}
