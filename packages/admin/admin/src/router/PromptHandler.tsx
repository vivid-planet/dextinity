import type * as History from "history";
import { type PropsWithChildren, type RefObject, useRef, useState } from "react";
import { matchPath, Prompt } from "react-router";

import { PromptAction, RouterConfirmationDialog } from "./ConfirmationDialog";
import { RouterContext } from "./Context";
import type { PromptRoutes } from "./Prompt";

interface PromptHandlerState {
    showConfirmationDialog: boolean;
    message: string;
    callback?: (ok: boolean) => void;
}
export interface PromptHandlerApi {
    showDialog: (message: string, callback: (ok: boolean) => void) => void;
}
function InnerPromptHandler({
    registeredMessages,
    apiRef,
}: {
    registeredMessages: RefObject<PromptMessages>;
    apiRef: RefObject<PromptHandlerApi | undefined>;
}) {
    const [state, setState] = useState<PromptHandlerState>({
        showConfirmationDialog: false,
        message: "",
        callback: undefined,
    });
    if (apiRef) {
        apiRef.current = {
            showDialog: (message: string, callback: (ok: boolean) => void) => {
                setState({
                    showConfirmationDialog: true,
                    message,
                    callback,
                });
            },
        };
    }

    const promptMessage = (location: History.Location, action: History.Action): boolean | string => {
        for (const id of Object.keys(registeredMessages.current)) {
            const path = registeredMessages.current[id].path;
            const subRoutePath = registeredMessages.current[id].subRoutePath;
            const promptRoutes = registeredMessages.current[id].promptRoutes?.current ?? {};

            const promptRouteMatches = Object.values(promptRoutes).some((route) => {
                return matchPath(location.pathname, { path: route.path, exact: true });
            });
            const subRouteMatches = subRoutePath && location.pathname.startsWith(subRoutePath);
            const pathMatches = matchPath(location.pathname, { path, exact: true });

            if (promptRouteMatches || (!subRouteMatches && !pathMatches)) {
                const message = registeredMessages.current[id].message(location, action);
                if (message !== true) {
                    return message;
                }
            }
        }
        return true;
    };

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
        if (state.callback) {
            state.callback(allowTransition);
        }
        setState({
            showConfirmationDialog: false,
            message: "",
            callback: undefined,
        });
    };

    return (
        <>
            <RouterConfirmationDialog
                isOpen={state.showConfirmationDialog}
                message={state.message}
                handleClose={handleClose}
                showSaveButton={Object.values(registeredMessages.current).some((registeredMessage) => !!registeredMessage.saveAction)}
            />
            <Prompt when={true} message={promptMessage} />
        </>
    );
}

interface PromptMessages {
    [id: string]: {
        message: (location: History.Location, action: History.Action) => boolean | string;
        path: string;
        subRoutePath?: string;
        saveAction?: SaveAction;
        resetAction?: ResetAction;
        promptRoutes?: RefObject<PromptRoutes>;
    };
}
interface Props {
    apiRef: RefObject<PromptHandlerApi | undefined>;
}

type SaveActionSuccess = boolean;
export type SaveAction = (() => Promise<SaveActionSuccess>) | (() => SaveActionSuccess);
export type ResetAction = () => void;

export const RouterPromptHandler = function ({ children, apiRef }: PropsWithChildren<Props>) {
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
        message: (location: History.Location, action: History.Action) => string | boolean;
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
            <InnerPromptHandler registeredMessages={registeredMessages} apiRef={apiRef} />
            {children}
        </RouterContext.Provider>
    );
};
