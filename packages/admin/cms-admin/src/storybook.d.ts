import type { InitialEntry } from "react-router";

import type { ContentScopeProviderProps } from "./contentScope/Provider";

export type ContentScopeParameters = Pick<ContentScopeProviderProps, "values" | "defaultValue">;

export interface RouterParameters {
    // Must start with the URL of a content scope, as the ContentScopeProviderDecorator redirects other URLs to the default scope.
    initialEntries?: InitialEntry[];
    initialIndex?: number;
}

declare module "storybook/internal/types" {
    interface Parameters {
        // Configures the scope provided by the global ContentScopeProviderDecorator.
        contentScope?: ContentScopeParameters;
        // Configures the memory router provided by the global RouterDecorator.
        router?: RouterParameters;
    }
}
