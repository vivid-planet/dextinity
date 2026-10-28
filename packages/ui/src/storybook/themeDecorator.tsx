import type { Decorator } from "@storybook/react-vite";

import { Theme } from "../components/theme/Theme";

/**
 * Wraps a story in {@link Theme}. Opt in per story file through `meta.decorators`.
 */
export const themeDecorator: Decorator = (Story) => (
    <Theme>
        <Story />
    </Theme>
);
