import { createContext, type PropsWithChildren, useContext, useEffect, useMemo } from "react";

import type { EditBlocks } from "./editBlocks";

/** A page registers the tools it supports; one whose entry is missing is unavailable while it is open. */
export type AiModePageTools = {
    editBlocks?: EditBlocks;
};

// Deliberately separate from AiModePageStateContext: that one carries the context the agent is given
// about what is currently open, this one carries the actions a page offers. They are registered by
// the same page but have nothing else in common — the page state is read (and pushed) continuously,
// while these are invoked once per tool call.
type AiModePageToolsStore = {
    getCurrent: () => AiModePageTools | null;
    set: (tools: AiModePageTools | null) => void;
};

// No subscription: unlike the page state, nothing re-renders or is pushed to the agent when the
// registered tools change — the host tools read them at call time.
const createAiModePageToolsStore = (): AiModePageToolsStore => {
    let current: AiModePageTools | null = null;

    return {
        getCurrent: () => current,
        set: (tools) => {
            current = tools;
        },
    };
};

const AiModePageToolsContext = createContext<AiModePageToolsStore>(createAiModePageToolsStore());

export function AiModePageToolsProvider({ children }: PropsWithChildren) {
    const store = useMemo(createAiModePageToolsStore, []);

    return <AiModePageToolsContext.Provider value={store}>{children}</AiModePageToolsContext.Provider>;
}

export function useAiModePageToolsStore() {
    return useContext(AiModePageToolsContext);
}

/** Pass null from a page (or a page state) that offers no tools. */
export function useRegisterAiModePageTools(tools: AiModePageTools | null) {
    const store = useAiModePageToolsStore();

    // Re-registered on every render on purpose: nothing subscribes to the store, so this is a single
    // assignment that triggers no further work. It keeps the registered callbacks current without the
    // page having to memoize them, and without a ref that could hand out a stale closure.
    useEffect(() => {
        store.set(tools);
    });

    useEffect(() => {
        // Clear on unmount, so the tools of a page that is no longer open cannot be invoked.
        return () => {
            store.set(null);
        };
    }, [store]);
}
