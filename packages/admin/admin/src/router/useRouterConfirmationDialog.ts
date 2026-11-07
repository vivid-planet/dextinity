import { createContext, useContext, useEffect, useSyncExternalStore } from "react";

/**
 * The unsaved-changes dialog the router shows before leaving a page with a `RouterPrompt`, for rendering it with another component than
 * the built-in `RouterConfirmationDialog`.
 */
export interface RouterConfirmationDialogState {
    open: boolean;
    /** The message of the prompt that blocked the navigation, e.g. "Save your changes?". */
    message: string;
    /** Whether the prompts can save, i.e. every `RouterPrompt` has a `saveAction`. */
    showSaveButton: boolean;
    /** Saves the changes of all prompts and navigates on success. */
    onSave: () => Promise<void>;
    /** Resets the changes of all prompts and navigates. */
    onDiscard: () => Promise<void>;
    /** Stays on the page. */
    onCancel: () => Promise<void>;
}

const closedState: RouterConfirmationDialogState = {
    open: false,
    message: "",
    showSaveButton: false,
    onSave: async () => undefined,
    onDiscard: async () => undefined,
    onCancel: async () => undefined,
};

export function createRouterConfirmationDialogRegistry() {
    let state = closedState;
    let customDialogCount = 0;
    const listeners = new Set<() => void>();
    const notify = () => listeners.forEach((listener) => listener());

    return {
        subscribe: (listener: () => void) => {
            listeners.add(listener);
            return () => {
                listeners.delete(listener);
            };
        },
        getState: () => state,
        hasCustomDialog: () => customDialogCount > 0,
        publish: (nextState: RouterConfirmationDialogState) => {
            state = nextState;
            notify();
        },
        registerCustomDialog: () => {
            customDialogCount += 1;
            notify();
            return () => {
                customDialogCount -= 1;
                notify();
            };
        },
    };
}

export type RouterConfirmationDialogRegistry = ReturnType<typeof createRouterConfirmationDialogRegistry>;

export const RouterConfirmationDialogRegistryContext = createContext<RouterConfirmationDialogRegistry | undefined>(undefined);

const subscribeToNothing = () => () => undefined;
const getClosedState = () => closedState;

/**
 * Takes over the unsaved-changes dialog of the router (`RouterBrowserRouter`, `RouterMemoryRouter`): while a component calls this hook,
 * the built-in `RouterConfirmationDialog` isn't shown, and the component renders the dialog from the returned state instead.
 */
export function useRouterConfirmationDialog(): RouterConfirmationDialogState {
    const registry = useContext(RouterConfirmationDialogRegistryContext);

    useEffect(() => registry?.registerCustomDialog(), [registry]);

    return useSyncExternalStore(registry?.subscribe ?? subscribeToNothing, registry?.getState ?? getClosedState);
}
