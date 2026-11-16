import "@fontsource-variable/inter";
import "@fontsource/source-sans-pro/400.css";
import "@fontsource/source-sans-pro/600.css";
import "@fontsource/source-sans-pro/700.css";
import "../icons.css";

import type { Preview } from "@storybook/react-vite";

import { CanvasWithStyleSource } from "../src/storybook/CanvasWithStyleSource";
import { argsUpdatesInTestsDecorator } from "../src/storybook/argsUpdatesInTests";
import { colorSchemeBackgroundDecorator } from "../src/storybook/colorSchemeBackgroundDecorator";
import { DocsPage } from "../src/storybook/docs/DocsPage";
import { closedOnDocsPageDecorator, openAgainAfterDocsPage, popupRoomDecorator } from "../src/storybook/docsPopups";
import { checkDocsPopups, docsFrameDecorator } from "../src/storybook/docsPopupsCheck";
import { keyboardPlatformDecorator } from "../src/storybook/keyboardPlatformDecorator";
import { renderSourceWithArgs } from "../src/storybook/renderSourceWithArgs";
import { restoreMocksOnFirstRender } from "../src/storybook/restoreMocksOnFirstRender";

const preview: Preview = {
    tags: ["autodocs"],
    // `ref` reaches the props table only for some components, and without a description
    argTypes: { ref: { table: { disable: true } } },
    beforeEach: [restoreMocksOnFirstRender, openAgainAfterDocsPage],
    decorators: [colorSchemeBackgroundDecorator, keyboardPlatformDecorator, popupRoomDecorator, closedOnDocsPageDecorator, docsFrameDecorator, argsUpdatesInTestsDecorator],
    afterEach: checkDocsPopups,
    parameters: {
        test: { restoreMocks: false },
        docs: {
            codePanel: true,
            page: DocsPage,
            components: { Canvas: CanvasWithStyleSource },
            source: { type: "dynamic", transform: renderSourceWithArgs },
        },
        options: {
            storySort: {
                // Mirrors the structure of the design system draft
                order: [
                    "Intro",
                    "Foundations",
                    [
                        "Colors",
                        "OKLCH color space",
                        "Typography",
                        "Spacing, radii & material",
                        "Tokens",
                        "Icons",
                        ["Icon", "All icons", "Customize icons"],
                        "Motion",
                        "Theme",
                        ["Overview", "Customize brand", "Theme"],
                    ],
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
                    ["App frame", "Navigation", "Top bar & scope", "Search & commands"],
                    "Patterns",
                    [
                        "Search & filter",
                        "Multi-select",
                        "Save & status",
                        "Undo instead of confirm",
                        "Empty, loading & error",
                        "Translation at the field",
                        "Drag & drop",
                        "Keyboard shortcuts",
                        "Actions",
                        "Forms",
                        "Toolbar",
                        "Main navigation",
                        "App shell",
                    ],
                    "Page types",
                    ["Overview", "List", "Tree + detail", "Edit", "Finder", "List + side panel"],
                ],
            },
        },
    },
};

export default preview;
