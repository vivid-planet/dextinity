import { createToolbarSetting } from "./toolbarSetting";

/**
 * The brands that ship with the package, and `mui-admin`, a brand defined in Storybook the way an application would (`muiAdminBrand.css`).
 */
export const brandSetting = createToolbarSetting({
    storageKey: "dextinity-ui-brand",
    titles: {
        dextinity: "Dextinity",
        "ai-hub": "Dextinity AI Hub",
        "mui-admin": "Dextinity Admin (MUI)",
    },
    defaultValue: "dextinity",
});
