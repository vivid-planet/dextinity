import { useStoredState } from "@dextinity/admin";
import { createContext, type PropsWithChildren, useCallback, useContext, useMemo } from "react";

type AiModeContextValue = {
    /** Whether the AI Hub is configured, see `isAiHubConfigured`, and the user has the `aiHub` permission. */
    isEnabled: boolean;
    /** Whether the page that is open supports the AI Mode. For now, only the page tree does. */
    isAvailable: boolean;
    isOpen: boolean;
    toggle: () => void;
};

const AiModeContext = createContext<AiModeContextValue>({ isEnabled: false, isAvailable: false, isOpen: false, toggle: () => undefined });

// Takes `isEnabled` and `isAvailable` from the caller rather than reading the config and the route itself, so that it
// renders without the content scope, e.g. in a component spec.
export function AiModeProvider({ isEnabled, isAvailable, children }: PropsWithChildren<{ isEnabled: boolean; isAvailable: boolean }>) {
    const [isStoredOpen, setIsOpen] = useStoredState<boolean>("ai-mode-open", false);
    // The stored state is kept while a page without the AI Mode is open, so the flyout opens again on returning to one with it.
    const isOpen = isEnabled && isAvailable && isStoredOpen;

    const toggle = useCallback(() => {
        setIsOpen((value) => !value);
    }, [setIsOpen]);

    const value = useMemo(() => ({ isEnabled, isAvailable, isOpen, toggle }), [isEnabled, isAvailable, isOpen, toggle]);

    return <AiModeContext.Provider value={value}>{children}</AiModeContext.Provider>;
}

export function useAiMode() {
    return useContext(AiModeContext);
}
