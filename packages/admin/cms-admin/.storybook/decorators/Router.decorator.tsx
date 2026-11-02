import { RouterMemoryRouter } from "@dextinity/admin";
import type { Decorator } from "@storybook/react-vite";
import { type PropsWithChildren, useEffect } from "react";
import { useLocation, useNavigationType } from "react-router";
import { action } from "storybook/actions";

function LocationWatcher({ children }: PropsWithChildren) {
    const location = useLocation();
    const navigationType = useNavigationType();

    useEffect(() => {
        action(navigationType)(location.pathname);
    }, [location, navigationType]);

    return <>{children}</>;
}

export const RouterDecorator: Decorator = (Story) => (
    <RouterMemoryRouter>
        <LocationWatcher>
            <Story />
        </LocationWatcher>
    </RouterMemoryRouter>
);
