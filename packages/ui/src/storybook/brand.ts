import { createToolbarSetting } from "./toolbarSetting";

/**
 * The brands that ship with the package, and `flat` and `flat-colorful`, brands defined in Storybook the way an application would (`flatBrand.css`, `flatColorfulBrand.css`).
 */
export const brandSetting = createToolbarSetting({
    storageKey: "dextinity-ui-brand",
    titles: {
        dextinity: "Dextinity",
        "ai-hub": "Dextinity AI Hub",
        flat: "Flat",
        "flat-colorful": "Flat colorful",
    },
    defaultValue: "dextinity",
});
