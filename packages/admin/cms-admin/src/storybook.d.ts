import type { ContentScopeProviderProps } from "./contentScope/Provider";

export type ContentScopeParameters = Pick<ContentScopeProviderProps, "values" | "defaultValue">;

declare module "storybook/internal/types" {
    interface Parameters {
        // Configures the scope provided by the global ContentScopeProviderDecorator.
        contentScope?: ContentScopeParameters;
    }
}
