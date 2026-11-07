import { createToolbarSetting } from "./toolbarSetting";

/**
 * The brands that ship with the package.
 */
export const brandSetting = createToolbarSetting({
    storageKey: "dextinity-ui-brand",
    titles: {
        dextinity: "Dextinity",
        "ai-hub": "Dextinity AI Hub",
        cms: "Dextinity CMS",
    },
    defaultValue: "dextinity",
});
