import { createToolbarSetting } from "./toolbarSetting";

/**
 * The brands that ship with the package.
 */
export const brandSetting = createToolbarSetting({
    storageKey: "dextinity-ui-brand",
    titles: {
        dextinity: "Dextinity",
        "ai-hub": "Dextinity AI Hub",
        "groupcms-ai": "GroupCMS AI",
        original: "Original Style",
    },
    defaultValue: "dextinity",
});
