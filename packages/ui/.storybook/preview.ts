import "@fontsource-variable/inter";
import "@fontsource/source-sans-pro/400.css";
import "@fontsource/source-sans-pro/600.css";
import "@fontsource/source-sans-pro/700.css";
import "../icons.css";

import type { Decorator, Preview } from "@storybook/react-vite";

import { colorSchemeBackgroundDecorator } from "../src/storybook/colorSchemeBackgroundDecorator";
import { DocsPage } from "../src/storybook/docs/DocsPage";
import { themeDecorator } from "../src/storybook/themeDecorator";

// The stories of the form adapter packages can't import this package's story helpers, so they get the toolbar theme here
const formsThemeDecorator: Decorator = (Story, context) => (context.title.startsWith("Forms/") ? themeDecorator(Story, context) : Story());

const preview: Preview = {
    tags: ["autodocs"],
    decorators: [colorSchemeBackgroundDecorator, formsThemeDecorator],
    parameters: {
        docs: {
            codePanel: true,
            page: DocsPage,
        },
        options: {
            storySort: {
                // Mirrors the structure of the design system draft
                order: [
                    "Intro",
                    "Foundations",
                    ["Colors", "Typography", "Spacing, radii & material", "Tokens", "Icons", "Motion", "Theme"],
                    "Building blocks",
                    [
                        "Buttons",
                        "Form fields",
                        "Selection & toggles",
                        "Status, tags & badges",
                        "Tables & paging",
                        "Tree",
                        "Panels, cards & metrics",
                        "Page header, breadcrumbs & links",
                        "Media & upload",
                        "Blocks & preview",
                        "Loading & save state",
                        "Menus & messages",
                        "Modals & overlays",
                    ],
                    "Shell",
                    ["App frame", "Navigation", "Top bar & scope", "AI assistant", "Search & commands"],
                    "Patterns",
                    [
                        "Search & filter",
                        "Multi-select",
                        "Save & status",
                        "Undo instead of confirm",
                        "Empty, loading & error",
                        "Translate & AI at the field",
                        "Drag & drop",
                        "Keyboard",
                    ],
                    "Page types",
                    ["Overview", "List", "Tree + detail", "Edit", "Finder", "List + side panel"],
                    "Forms",
                    ["Final Form", ["Example form"], "React Hook Form", ["Example form"]],
                ],
            },
        },
    },
};

export default preview;
