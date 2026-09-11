import { RouterMemoryRouter } from "@dextinity/admin";
import type { Decorator } from "@storybook/react-vite";
import type { Action, History, UnregisterCallback } from "history";
import { type PropsWithChildren, useEffect } from "react";
import { Route, type RouteComponentProps } from "react-router";
import { action } from "storybook/actions";

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

export const RouterDecorator: Decorator = (Story) => (
    <RouterMemoryRouter>
        <Route
            render={(props) => (
                <HistoryWatcher {...props}>
                    <Story />
                </HistoryWatcher>
            )}
        />
    </RouterMemoryRouter>
);
