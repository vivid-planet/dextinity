import React from "react";
import { Select } from "storybook/internal/components";
import { addons, types } from "storybook/manager-api";

import { getToolbarBrand, storeToolbarBrand, toolbarBrandOptions } from "../src/storybook/brand";
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

addons.register("dextinity-ui/brand", () => {
    addons.add("dextinity-ui/brand", {
        type: types.TOOL,
        title: "Brand",
        render: () => (
            <Select ariaLabel="Brand" options={toolbarBrandOptions} defaultOptions={getToolbarBrand()} onSelect={storeToolbarBrand} />
        ),
    });
});
