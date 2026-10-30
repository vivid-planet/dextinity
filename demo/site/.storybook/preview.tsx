import "@dextinity/site-nextjs/css";
import "@src/styles/global.scss";

import { Controls, Description, Primary, Stories, Subtitle, Title } from "@storybook/addon-docs/blocks";
import type { Preview } from "@storybook/nextjs-vite";

import { IntlProviderDecorator } from "./decorators/IntlProvider.decorator";
import { SiteConfigProviderDecorator } from "./decorators/SiteConfigProvider.decorator";

const preview: Preview = {
    tags: ["autodocs"],
    // The first decorator is the innermost one.
    decorators: [IntlProviderDecorator, SiteConfigProviderDecorator],
    parameters: {
        controls: {
            matchers: {
                color: /(background|color)$/i,
                date: /Date$/i,
            },
        },
        a11y: {
            test: "todo",
        },
        docs: {
            codePanel: true,
            page: () => (
                <>
                    <Title />
                    <Subtitle />
                    <Description />
                    <Primary />
                    <Controls />
                    <Stories includePrimary={false} />
                </>
            ),
        },
    },
};

export default preview;
