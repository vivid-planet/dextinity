import React from "react";
import { Select } from "storybook/internal/components";
import { addons, types } from "storybook/manager-api";
import { defaultConfig, type TagBadgeParameters } from "storybook-addon-tag-badges/manager-helpers";

import { getToolbarColorScheme, storeToolbarColorScheme, toolbarColorSchemeOptions } from "../src/storybook/colorScheme";

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
