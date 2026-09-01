import { createContext, type Dispatch, type PropsWithChildren, type SetStateAction, useContext, useMemo } from "react";

export interface PageStateApi<PageState> {
    pageState?: PageState;
    /**
     * Updates the page state, for instance, to programmatically change the content of a root block.
     *
     * The changes are applied locally, the page must be saved to persist them.
     */
    setPageState: Dispatch<SetStateAction<PageState | undefined>>;
}

// The shape of the page state depends on the page's type, therefore it can't be typed here. Consumers pass the expected shape to usePageState.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const PageStateContext = createContext<PageStateApi<any> | undefined>(undefined);

/**
 * Provides the page state of an edit page to nested components, for instance, to the Admin AI mode.
 *
 * Wrap the content of an edit page with it and pass the values returned by the usePage hook created with createUsePage.
 */
export function PageStateProvider<PageState>({ pageState, setPageState, children }: PropsWithChildren<PageStateApi<PageState>>) {
    const value = useMemo(() => ({ pageState, setPageState }), [pageState, setPageState]);

    return <PageStateContext.Provider value={value}>{children}</PageStateContext.Provider>;
}

/**
 * Gives access to the page state of the surrounding edit page, for instance, to read or modify the page's content.
 *
 * Returns undefined when used outside of an edit page.
 */
export function usePageState<PageState = unknown>(): PageStateApi<PageState> | undefined {
    return useContext(PageStateContext);
}
