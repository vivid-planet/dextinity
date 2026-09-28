import type { Decorator } from "@storybook/react-vite";

import { ContentScopeProvider } from "../../src/contentScope/Provider";
import type { ContentScopeParameters } from "../../src/storybook";

const defaultContentScope: Required<ContentScopeParameters> = {
    values: [{ scope: { domain: "main", language: "en" }, label: { domain: "Main", language: "English" } }],
    defaultValue: { domain: "main", language: "en" },
};

export const ContentScopeProviderDecorator: Decorator = (Story, context) => {
    const { values, defaultValue } = (context.parameters.contentScope ?? {}) as ContentScopeParameters;
    return (
        <ContentScopeProvider values={values ?? defaultContentScope.values} defaultValue={defaultValue ?? defaultContentScope.defaultValue}>
            {() => <Story />}
        </ContentScopeProvider>
    );
};
