import { MockedProvider } from "@apollo/client/testing/react";
import { RouterMemoryRouter } from "@dextinity/admin";
import type { Decorator } from "@storybook/react-vite";

export function editDialogDecorator(): Decorator {
    return (Story) => {
        return (
            <MockedProvider>
                <RouterMemoryRouter>
                    <Story />
                </RouterMemoryRouter>
            </MockedProvider>
        );
    };
}
