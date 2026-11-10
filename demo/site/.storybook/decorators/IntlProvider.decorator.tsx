import type { Decorator } from "@storybook/nextjs-vite";
import { IntlProvider } from "react-intl";

// The site loads its compiled messages per request. Stories render with empty messages, so every component falls
// back to its `defaultMessage` and missing-message errors are silenced.
export const IntlProviderDecorator: Decorator = (Story) => (
    <IntlProvider
        locale="en"
        defaultLocale="en"
        messages={{}}
        onError={() => {
            // noop
        }}
    >
        <Story />
    </IntlProvider>
);
