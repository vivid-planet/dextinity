import type { Decorator } from "@storybook/react-vite";
import { type PropsWithChildren, useEffect } from "react";
import { useLocation, useNavigationType } from "react-router";
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

function LocationWatcher({ children }: PropsWithChildren) {
    const location = useLocation();
    const navigationType = useNavigationType();

    useEffect(() => {
        action(navigationType)(location.pathname);
    }, [location, navigationType]);

    return <>{children}</>;
}

export const RouterDecorator: Decorator = (Story, context) => {
    const stackParams = context.parameters.stack;

    return (
        <RouterMemoryRouter>
            <LocationWatcher>
                {stackParams !== undefined ? (
                    <Stack topLevelTitle={stackParams.topLevelTitle ?? "Example"}>
                        <Story />
                    </Stack>
                ) : (
                    <Story />
                )}
            </LocationWatcher>
        </RouterMemoryRouter>
    );
};
