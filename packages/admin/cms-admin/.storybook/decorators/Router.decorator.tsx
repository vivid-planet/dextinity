import { RouterMemoryRouter } from "@dextinity/admin";
import type { Decorator } from "@storybook/react-vite";
import { useEffect, useRef } from "react";
import { useLocation, useNavigationType } from "react-router";
import { action } from "storybook/actions";

import type { RouterParameters } from "../../src/storybook";

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
    const { initialEntries, initialIndex } = (context.parameters.router ?? {}) as RouterParameters;

    return (
        <RouterMemoryRouter initialEntries={initialEntries} initialIndex={initialIndex}>
            <NavigationActionLogger />
            <Story />
        </RouterMemoryRouter>
    );
};
