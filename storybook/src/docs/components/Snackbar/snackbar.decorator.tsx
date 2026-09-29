import { SnackbarProvider } from "@dextinity/admin";
import type { Decorator } from "@storybook/react-vite";

export function snackbarDecorator(): Decorator {
    return (Story) => {
        return (
            <SnackbarProvider>
                <Story />
            </SnackbarProvider>
        );
    };
}
