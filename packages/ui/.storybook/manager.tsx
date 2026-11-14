import React from "react";
import { AddonPanel, Select } from "storybook/internal/components";
import { addons, types } from "storybook/manager-api";
import { defaultConfig, type TagBadgeParameters } from "storybook-addon-tag-badges/manager-helpers";

import { brandSetting } from "../src/storybook/brand";
import { colorSchemeSetting } from "../src/storybook/colorScheme";
import { densitySetting } from "../src/storybook/density";
import { keyboardPlatformSetting } from "../src/storybook/keyboardPlatform";
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

const toolbarSettings = [
    { id: "color-scheme", title: "Color scheme", setting: colorSchemeSetting },
    { id: "brand", title: "Brand", setting: brandSetting },
    { id: "density", title: "Density", setting: densitySetting },
    { id: "keyboard-platform", title: "Keyboard platform", setting: keyboardPlatformSetting },
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
