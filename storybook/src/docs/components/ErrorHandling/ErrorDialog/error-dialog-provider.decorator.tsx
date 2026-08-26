import { ErrorDialogHandler } from "@dextinity/admin";
import type { Decorator } from "@storybook/react-vite";

export function errorDialogStoryProviderDecorator(): Decorator {
    return (Story) => {
        return (
            <>
                <ErrorDialogHandler />
                <Story />
            </>
        );
    };
}
