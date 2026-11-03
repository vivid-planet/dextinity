import { type PropsWithChildren, type RefObject, useCallback, useEffect, useMemo, useRef } from "react";
import { type BlockerFunction, type Location, matchPath, type NavigationType, useBlocker } from "react-router";

import { PromptAction, RouterConfirmationDialog } from "./ConfirmationDialog";
import { RouterContext } from "./Context";
import { useIsNavigationBlocked } from "./internal/routeContext";
import type { PromptRoutes } from "./Prompt";

interface PromptMessages {
    [id: string]: {
        message: (location: Location, action: NavigationType) => boolean | string;
        path?: string;
        subRoutePath?: string;
        saveAction?: SaveAction;
        resetAction?: ResetAction;
        promptRoutes?: RefObject<PromptRoutes>;
    };
}

type SaveActionSuccess = boolean;
export type SaveAction = (() => Promise<SaveActionSuccess>) | (() => SaveActionSuccess);
export type ResetAction = () => void;

function getPromptMessage(registeredMessages: PromptMessages, location: Location, action: NavigationType): boolean | string {
    for (const id of Object.keys(registeredMessages)) {
        const path = registeredMessages[id].path;
        const subRoutePath = registeredMessages[id].subRoutePath;
        const promptRoutes = registeredMessages[id].promptRoutes?.current ?? {};

        const promptRouteMatches = Object.values(promptRoutes).some((route) => {
            return matchPath({ path: route.path, end: true }, location.pathname);
        });
        const subRouteMatches = subRoutePath && location.pathname.startsWith(subRoutePath);
        const pathMatches = path !== undefined && matchPath({ path, end: true }, location.pathname);

        if (promptRouteMatches || (!subRouteMatches && !pathMatches)) {
            const message = registeredMessages[id].message(location, action);
            if (message !== true) {
                return message;
            }
        }
    }
    return true;
}

function InnerPromptHandler({ registeredMessages }: { registeredMessages: RefObject<PromptMessages> }) {
    const blockingMessage = useRef<string | false>(false);

    const shouldBlockNavigation = useCallback<BlockerFunction>(
        ({ nextLocation, historyAction }) => {
            const message = getPromptMessage(registeredMessages.current, nextLocation, historyAction);
            if (message === true) {
                return false;
            }
            blockingMessage.current = message;
            return true;
        },
        [registeredMessages],
    );
    const blocker = useBlocker(shouldBlockNavigation);
    const isNavigationBlocked = useIsNavigationBlocked();
    const isSaving = useRef(false);

    useEffect(() => {
        // A message returning false blocks the navigation without asking the user
        if (blocker.state === "blocked" && blockingMessage.current === false) {
            blocker.reset();
        }
    }, [blocker]);

    const handleClose = async (action: PromptAction) => {
        // `blocker` is only updated with the next render. It must not be used once its navigation has been proceeded or reset
        // (e.g. by a double click or by another navigation while saving): proceeding it again throws
        if (blocker.state !== "blocked" || !isNavigationBlocked()) {
            return;
        }

        if (action === PromptAction.Save) {
            if (isSaving.current) {
                return;
            }
            const saveActions = Object.values(registeredMessages.current)
                .filter((registeredMessage) => !!registeredMessage.saveAction)
                .map((registeredMessage) => registeredMessage.saveAction);
            isSaving.current = true;
            const results: Array<SaveActionSuccess> = await Promise.all(saveActions.map((saveAction) => saveAction!())).finally(() => {
                isSaving.current = false;
            });
            if (!isNavigationBlocked()) {
                return;
            }
            if (results.every((saveActionSuccess) => saveActionSuccess)) {
                blocker.proceed();
            } else {
                blocker.reset();
            }
        } else if (action === PromptAction.Discard) {
            for (const msg of Object.values(registeredMessages.current)) {
                msg.resetAction?.();
            }
            blocker.proceed();
        } else {
            blocker.reset();
        }
    };

    return (
        <RouterConfirmationDialog
            isOpen={blocker.state === "blocked" && blockingMessage.current !== false}
            message={blockingMessage.current === false ? undefined : blockingMessage.current}
            handleClose={handleClose}
            showSaveButton={Object.values(registeredMessages.current).some((registeredMessage) => !!registeredMessage.saveAction)}
        />
    );
}

/**
 * Asks the user before leaving a dirty `RouterPrompt`. It owns the router's only `useBlocker()`, so it must be rendered inside a
 * data router and the application must not call `useBlocker()` itself. `RouterBrowserRouter` and `RouterMemoryRouter` already render it.
 */
export const RouterPromptHandler = function ({ children }: PropsWithChildren) {
    const registeredMessages = useRef<PromptMessages>({});

    const contextValue = useMemo(
        () => ({
            register: ({
                id,
                message,
                saveAction,
                resetAction,
                path,
                subRoutePath,
                promptRoutes,
            }: {
                id: string;
                message: (location: Location, action: NavigationType) => string | boolean;
                saveAction?: SaveAction;
                resetAction?: ResetAction;
                path?: string;
                subRoutePath?: string;
                promptRoutes?: RefObject<PromptRoutes>;
            }) => {
                registeredMessages.current[id] = { message, path, subRoutePath, saveAction, resetAction, promptRoutes };
                // If saveAction is passed it has to be passed for all registered components
                if (saveAction && Object.values(registeredMessages.current).some((registeredMessage) => !registeredMessage.saveAction)) {
                    console.error(
                        "A component (e.g. RouterPrompt) is missing a saveAction-prop. If you fail to do so, the Save-Button in the Dirty-Dialog won't save the changes",
                    );
                }
            },
            unregister: (id: string) => {
                delete registeredMessages.current[id];
            },
        }),
        [],
    );

    return (
        <RouterContext.Provider value={contextValue}>
            {/* inner component not wrapping children contains local state to avoid rerender on state change */}
            <InnerPromptHandler registeredMessages={registeredMessages} />
            {children}
        </RouterContext.Provider>
    );
};
