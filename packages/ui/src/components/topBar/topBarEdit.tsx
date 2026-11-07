import { createContext, type ReactNode, useContext, useEffect, useLayoutEffect, useState } from "react";

import type { TopBarBack } from "./TopBar";

/** What a page shows in the `TopBar` while it edits something. */
export interface TopBarEdit {
    /** The back button at the start, e.g. to the list the edited item belongs to. */
    back?: TopBarBack;
    /** What is edited, e.g. the page's name, after the back button. */
    title?: ReactNode;
    /** Save state, preview, more actions, and Save, the bar's only primary action. */
    actions?: ReactNode;
}

const TopBarEditContext = createContext<TopBarEdit | undefined>(undefined);
const SetTopBarEditContext = createContext<((edit: TopBarEdit | undefined) => void) | undefined>(undefined);

const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

export interface TopBarEditProviderProps {
    /** The part of the app whose pages set the edit mode with `useTopBarEdit`, and the `TopBar` that shows it. */
    children: ReactNode;
}

/**
 * Lets a page switch the `TopBar` to its edit mode with `useTopBarEdit`, without passing props through the app frame. `AppShell` already
 * provides it for its top bar and content; add it yourself only without `AppShell`.
 */
export function TopBarEditProvider({ children }: TopBarEditProviderProps) {
    const [edit, setEdit] = useState<TopBarEdit>();
    return (
        <SetTopBarEditContext.Provider value={setEdit}>
            <TopBarEditContext.Provider value={edit}>{children}</TopBarEditContext.Provider>
        </SetTopBarEditContext.Provider>
    );
}

/**
 * Switches the `TopBar` to its edit mode with back button, title, and actions while the calling page is shown, e.g. an editor; it
 * switches back when the page unmounts or passes `undefined`. Pass the current state on every render, e.g. the save state in `actions`.
 */
export function useTopBarEdit(edit: TopBarEdit | undefined) {
    const setEdit = useContext(SetTopBarEditContext);

    useIsomorphicLayoutEffect(() => {
        setEdit?.(edit);
    }, [setEdit, edit]);

    useIsomorphicLayoutEffect(() => () => setEdit?.(undefined), [setEdit]);
}

/** The edit mode a page set with `useTopBarEdit`, for the `TopBar`. */
export function useTopBarEditState() {
    return useContext(TopBarEditContext);
}
