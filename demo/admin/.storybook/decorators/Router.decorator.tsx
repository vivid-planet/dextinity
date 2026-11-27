import { RouterMemoryRouter } from "@dextinity/admin";
import type { Decorator } from "@storybook/react-vite";

export const RouterDecorator: Decorator = (Story) => (
    <RouterMemoryRouter>
        <Story />
    </RouterMemoryRouter>
);
