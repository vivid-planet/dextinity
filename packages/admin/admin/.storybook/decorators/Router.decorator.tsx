import type { Decorator } from "@storybook/react-vite";
import type { Action, History, UnregisterCallback } from "history";
import { type PropsWithChildren, useEffect } from "react";
import { Route, type RouteComponentProps } from "react-router";
import { action } from "storybook/actions";

import { RouterMemoryRouter } from "../../src/router/MemoryRouter";
import { Stack } from "../../src/stack/Stack";

declare module "storybook/internal/csf" {
    interface Parameters {
        stack?: {
            topLevelTitle?: string;
        };
    }
}

function HistoryWatcher({ history, children }: PropsWithChildren<RouteComponentProps>) {
    useEffect(() => {
        const onHistoryChanged: History.LocationListener = (location, historyAction: Action) => {
            const path = location.pathname;
            action(historyAction ? historyAction : (location as any).action)(path);
        };
        const unlisten: UnregisterCallback = history.listen(onHistoryChanged);

        return () => {
            unlisten();
        };
    }, [history]);

    return <>{children}</>;
}

export const RouterDecorator: Decorator = (Story, context) => {
    const stackParams = context.parameters.stack;

    return (
        <RouterMemoryRouter>
            <Route
                render={(props) => (
                    <HistoryWatcher {...props}>
                        {stackParams !== undefined ? (
                            <Stack topLevelTitle={stackParams.topLevelTitle ?? "Example"}>
                                <Story />
                            </Stack>
                        ) : (
                            <Story />
                        )}
                    </HistoryWatcher>
                )}
            />
        </RouterMemoryRouter>
    );
};
