import { ContentScopeProvider } from "@dextinity/cms-admin";
import type { Decorator } from "@storybook/react-vite";

export const ContentScopeProviderDecorator: Decorator = (Story) => (
    <ContentScopeProvider
        values={[{ scope: { domain: "main", language: "en" }, label: { domain: "Main", language: "English" } }]}
        defaultValue={{ domain: "main", language: "en" }}
    >
        {() => <Story />}
    </ContentScopeProvider>
);
