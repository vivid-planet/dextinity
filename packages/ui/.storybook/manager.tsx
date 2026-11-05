import React from "react";
import { Select } from "storybook/internal/components";
import { addons, types } from "storybook/manager-api";
import { defaultConfig, type TagBadgeParameters } from "storybook-addon-tag-badges/manager-helpers";

import { brandSetting } from "../src/storybook/brand";
import { colorSchemeSetting } from "../src/storybook/colorScheme";
import { densitySetting } from "../src/storybook/density";

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

const toolbarSettings = [
    { id: "color-scheme", title: "Color scheme", setting: colorSchemeSetting },
    { id: "brand", title: "Brand", setting: brandSetting },
    { id: "density", title: "Density", setting: densitySetting },
];

for (const { id, title, setting } of toolbarSettings) {
    addons.register(`dextinity-ui/${id}`, () => {
        addons.add(`dextinity-ui/${id}`, {
            type: types.TOOL,
            title,
            render: () => <Select ariaLabel={title} options={setting.options} defaultOptions={setting.get()} onSelect={setting.store} />,
        });
    });
}
