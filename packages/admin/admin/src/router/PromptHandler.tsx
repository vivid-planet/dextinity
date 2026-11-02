import { type PropsWithChildren, type RefObject, useCallback, useEffect, useRef } from "react";
import { type BlockerFunction, type Location, matchPath, type NavigationType, useBlocker } from "react-router";

import { PromptAction, RouterConfirmationDialog } from "./ConfirmationDialog";
import { RouterContext } from "./Context";
import type { PromptRoutes } from "./Prompt";
import { normalizePath } from "./RouteMatch";

function InnerPromptHandler({ registeredMessages }: { registeredMessages: RefObject<PromptMessages> }) {
    const promptMessage = useRef<string | false>(false);

    const shouldBlock = useCallback<BlockerFunction>(
        ({ nextLocation, historyAction }) => {
            for (const id of Object.keys(registeredMessages.current)) {
                const path = registeredMessages.current[id].path;
                const subRoutePath = registeredMessages.current[id].subRoutePath;
                const promptRoutes = registeredMessages.current[id].promptRoutes?.current ?? {};

                const promptRouteMatches = Object.values(promptRoutes).some((route) => {
                    return matchPath({ path: normalizePath(route.path), end: true }, nextLocation.pathname);
                });
                const subRouteMatches = subRoutePath && nextLocation.pathname.startsWith(subRoutePath);
                const pathMatches = matchPath({ path: normalizePath(path), end: true }, nextLocation.pathname);

                if (promptRouteMatches || (!subRouteMatches && !pathMatches)) {
                    const message = registeredMessages.current[id].message(nextLocation, historyAction);
                    if (message !== true) {
                        promptMessage.current = message;
                        return true;
                    }
                }
            }
            return false;
        },
        [registeredMessages],
    );
    const blocker = useBlocker(shouldBlock);
    const isBlockedWithoutMessage = blocker.state === "blocked" && promptMessage.current === false;

    useEffect(() => {
        if (isBlockedWithoutMessage) {
            blocker.reset?.();
        }
    }, [blocker, isBlockedWithoutMessage]);

    const handleClose = async (action: PromptAction) => {
        let allowTransition = false;
        const saveActions = Object.values(registeredMessages.current)
            .filter((registeredMessage) => !!registeredMessage.saveAction)
            .map((registeredMessage) => registeredMessage.saveAction);
        if (action === PromptAction.Save) {
            if (saveActions.length > 0) {
                const results: Array<SaveActionSuccess> = await Promise.all(saveActions.map((saveAction) => saveAction!()));
                allowTransition = results.every((saveActionSuccess) => saveActionSuccess);
            } else {
                allowTransition = true;
            }
        } else if (action === PromptAction.Discard) {
            allowTransition = true;
            for (const msg of Object.values(registeredMessages.current)) {
                msg.resetAction?.();
            }
        }
        if (allowTransition) {
            blocker.proceed?.();
        } else {
            blocker.reset?.();
        }
    };

    return (
        <RouterConfirmationDialog
            isOpen={blocker.state === "blocked" && !isBlockedWithoutMessage}
            message={typeof promptMessage.current === "string" ? promptMessage.current : ""}
            handleClose={handleClose}
            showSaveButton={Object.values(registeredMessages.current).some((registeredMessage) => !!registeredMessage.saveAction)}
        />
    );
}

interface PromptMessages {
    [id: string]: {
        message: (location: Location, action: NavigationType) => boolean | string;
        path: string;
        subRoutePath?: string;
        saveAction?: SaveAction;
        resetAction?: ResetAction;
        promptRoutes?: RefObject<PromptRoutes>;
    };
}
type SaveActionSuccess = boolean;
export type SaveAction = (() => Promise<SaveActionSuccess>) | (() => SaveActionSuccess);
export type ResetAction = () => void;

export const RouterPromptHandler = function ({ children }: PropsWithChildren) {
    const registeredMessages = useRef<PromptMessages>({});

    const register = ({
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
        path: string;
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
    };

    const unregister = (id: string) => {
        delete registeredMessages.current[id];
    };

    return (
        <RouterContext.Provider
            value={{
                register,
                unregister,
            }}
        >
            {/* inner component not wrapping children contains local state to avoid rerender on state change */}
            <InnerPromptHandler registeredMessages={registeredMessages} />
            {children}
        </RouterContext.Provider>
    );
};
