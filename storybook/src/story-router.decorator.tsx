import { RouterMemoryRouter } from "@dextinity/admin";
import type { Decorator } from "@storybook/react-vite";
import { useEffect, useRef } from "react";
import { type InitialEntry, useLocation, useNavigationType } from "react-router";
import { action } from "storybook/actions";

declare module "storybook/internal/csf" {
    interface Parameters {
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

export function storyRouterDecorator(): Decorator {
    return (Story, context) => {
        const routerParams = context.parameters.router;

        return (
            <RouterMemoryRouter initialEntries={routerParams?.initialEntries} initialIndex={routerParams?.initialIndex}>
                <NavigationActionLogger />
                <Story />
            </RouterMemoryRouter>
        );
    };
}
