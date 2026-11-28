import { parameters as mailParameters } from "../src/storybook/preview.ts";

export { decorators, initialGlobals } from "../src/storybook/preview.ts";

export const parameters = {
    ...mailParameters,
    layout: "fullscreen",
    options: {
        storySort: {
            order: [
                "Docs",
                [
                    "Getting Started",
                    ["Intro", "Email Basics", "Rendering and Preview"],
                    "Building Mails",
                    ["Theme and Configuration", "Components", "Styling and Customization", "Layout Patterns", "Blocks"],
                    "Client Issues",
                    [
                        "Classic Outlook",
                        "Gmail",
                        "Yahoo Mail and Outlook.com",
                        "Outlook on the Web and Apps",
                        "Apple Mail and Safari",
                        "Auto-Linked Text",
                        "Dark Mode",
                    ],
                ],
                "Examples",
                "Layout Patterns",
                "Components",
                "Blocks",
                "*",
            ],
        },
    },
    docs: {
        toc: { headingSelector: "h2, h3" },
        source: {
            // Regenerate the "Show code" snippet from the rendered JSX; the default shows the whole
            // story object literal for stories with a custom render function.
            type: "dynamic",
        },
    },
};
