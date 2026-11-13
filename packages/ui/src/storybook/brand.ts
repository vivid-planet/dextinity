import { createToolbarSetting } from "./toolbarSetting";

/**
 * The brands that ship with the package, and `flat`, a brand defined in Storybook the way an application would (`flatBrand.css`).
 */
export const brandSetting = createToolbarSetting({
    storageKey: "dextinity-ui-brand",
    titles: {
        dextinity: "Dextinity",
        "ai-hub": "Dextinity AI Hub",
        flat: "Flat",
    },
    defaultValue: "dextinity",
});
