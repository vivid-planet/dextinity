import type { Decorator } from "@storybook/react-vite";

import { CurrentUserProvider } from "../../src/userPermissions/hooks/currentUser";

export const CurrentUserProviderDecorator: Decorator = (Story) => (
    <CurrentUserProvider>
        <Story />
    </CurrentUserProvider>
);
