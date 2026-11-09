import React from "react";
import { AddonPanel, Select } from "storybook/internal/components";
import { addons, types } from "storybook/manager-api";
import { defaultConfig, type TagBadgeParameters } from "storybook-addon-tag-badges/manager-helpers";

import { getToolbarBrand, storeToolbarBrand, toolbarBrandOptions } from "../src/storybook/brand";
import { getToolbarColorScheme, storeToolbarColorScheme, toolbarColorSchemeOptions } from "../src/storybook/colorScheme";
import { StyleSourcePanel } from "./StyleSourcePanel";

addons.setConfig({
    tagBadges: [
        {
            tags: "development",
            badge: {
                text: "Dev",
                style: "blue",
                tooltip: "Development story: not part of the consumer docs, hidden from the sidebar by default",
            },
        },
        // Badges match in order, so the default config comes after the custom badges to let them take precedence
        ...defaultConfig,
    ] satisfies TagBadgeParameters,
});

addons.register("dextinity-ui/color-scheme", () => {
    addons.add("dextinity-ui/color-scheme", {
        type: types.TOOL,
        title: "Color scheme",
        render: () => (
            <Select
                ariaLabel="Color scheme"
                options={toolbarColorSchemeOptions}
                defaultOptions={getToolbarColorScheme()}
                onSelect={storeToolbarColorScheme}
            />
        ),
    });
});

addons.register("dextinity-ui/brand", () => {
    addons.add("dextinity-ui/brand", {
        type: types.TOOL,
        title: "Brand",
        render: () => <Select ariaLabel="Brand" options={toolbarBrandOptions} defaultOptions={getToolbarBrand()} onSelect={storeToolbarBrand} />,
    });
});

addons.register("dextinity-ui/style-source", () => {
    addons.add("dextinity-ui/style-source", {
        type: types.PANEL,
        title: "SCSS",
        disabled: (parameters) => typeof parameters?.styleSource !== "string",
        render: ({ active }) => (
            <AddonPanel active={active ?? false}>
                <StyleSourcePanel />
            </AddonPanel>
        ),
    });
});
