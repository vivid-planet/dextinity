import "@fontsource-variable/inter";
import "../icons.css";

import type { Preview } from "@storybook/react-vite";

import { brandDecorator } from "../src/storybook/brandDecorator";
import { CanvasWithStyleSource } from "../src/storybook/CanvasWithStyleSource";
import { colorSchemeBackgroundDecorator } from "../src/storybook/colorSchemeBackgroundDecorator";
import { DocsPage } from "../src/storybook/docs/DocsPage";
import { renderSourceWithArgs } from "../src/storybook/renderSourceWithArgs";

const preview: Preview = {
    tags: ["autodocs"],
    decorators: [colorSchemeBackgroundDecorator, brandDecorator],
    parameters: {
        options: {
            storySort: {
                // Mirrors the structure of the design system draft
                order: [
                    "Intro",
                    "Foundations",
                    [
                        "Colors",
                        "Typography",
                        "Spacing, radii & material",
                        "Tokens",
                        ["Overview", "Customize brand", "Theme"],
                        "Icons",
                        ["Icon", "All icons", "Customize icons"],
                        "Motion",
                    ],
                    "Building blocks",
                    ["Button", "IconButton", "Input", "FormLabel", "FormHelperText", "Chip", "Spinner"],
                    "Shell",
                    ["App frame", "Navigation", "NavItem", "MenuSectionHeader"],
                    "Patterns",
                    ["Actions", "Forms", "Toolbar"],
                ],
            },
        },
        docs: {
            codePanel: true,
            page: DocsPage,
            components: { Canvas: CanvasWithStyleSource },
            source: { type: "dynamic", transform: renderSourceWithArgs },
        },
    },
};

export default preview;
