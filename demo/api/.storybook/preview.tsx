import { Controls, Description, Primary, Stories, Subtitle, Title } from "@storybook/addon-docs/blocks";
import { type Decorator, type Preview } from "@storybook/react-vite";
import React from "react";
import { IntlProvider } from "react-intl";

const IntlDecorator: Decorator = (Story) => (
    <IntlProvider locale="en" defaultLocale="en" messages={{}}>
        <Story />
    </IntlProvider>
);

const preview: Preview = {
    tags: ["autodocs"],
    decorators: [IntlDecorator],
    parameters: {
        layout: "fullscreen",
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
