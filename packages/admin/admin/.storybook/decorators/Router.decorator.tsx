import type { Decorator } from "@storybook/react-vite";
import { useEffect, useRef } from "react";
import { type InitialEntry, useLocation, useNavigationType } from "react-router";
import { action } from "storybook/actions";

import { RouterMemoryRouter } from "../../src/router/MemoryRouter";
import { Stack } from "../../src/stack/Stack";

declare module "storybook/internal/csf" {
    interface Parameters {
        stack?: {
            topLevelTitle?: string;
        };
        router?: {
            initialEntries?: InitialEntry[];
            initialIndex?: number;
        };
    }
}

function NavigationActionLogger() {
    const location = useLocation();
    const navigationType = useNavigationType();
    const previousLocationKey = useRef(location.key);

    useEffect(() => {
        if (previousLocationKey.current === location.key) {
            return;
        }
        previousLocationKey.current = location.key;
        action(navigationType)(location.pathname);
    }, [location, navigationType]);

    return null;
}

export const RouterDecorator: Decorator = (Story, context) => {
    const stackParams = context.parameters.stack;
    const routerParams = context.parameters.router;

    return (
        <RouterMemoryRouter initialEntries={routerParams?.initialEntries} initialIndex={routerParams?.initialIndex}>
            <NavigationActionLogger />
            {stackParams !== undefined ? (
                <Stack topLevelTitle={stackParams.topLevelTitle ?? "Example"}>
                    <Story />
                </Stack>
            ) : (
                <Story />
            )}
        </RouterMemoryRouter>
    );
};
