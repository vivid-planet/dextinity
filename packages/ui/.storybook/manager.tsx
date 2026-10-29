import React from "react";
import { Select } from "storybook/internal/components";
import { addons, types } from "storybook/manager-api";

import { getToolbarColorScheme, storeToolbarColorScheme, toolbarColorSchemeOptions } from "../src/storybook/colorScheme";

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
