import "@fontsource-variable/inter";
import "@fontsource/source-sans-pro/400.css";
import "@fontsource/source-sans-pro/600.css";
import "@fontsource/source-sans-pro/700.css";
import "../icons.css";

import type { Preview } from "@storybook/react-vite";

import { colorSchemeBackgroundDecorator } from "../src/storybook/colorSchemeBackgroundDecorator";
import { DocsPage } from "../src/storybook/docs/DocsPage";

const preview: Preview = {
    tags: ["autodocs"],
    decorators: [colorSchemeBackgroundDecorator],
    parameters: {
        options: {
            storySort: {
                order: ["Intro", "*", "Theme", ["Overview", "Customize brand", "Customize icons", "All icons"], "Components"],
            },
        },
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
                ],
            },
        },
    },
};

export default preview;
