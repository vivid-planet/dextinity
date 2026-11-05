import { createToolbarSetting } from "./toolbarSetting";

/**
 * `dextinity`, `ai-hub`, and `cms` ship with the package. The others are example consumer brands from the backlog, defined in
 * `exampleBrands.scss`, showing that a brand is a CSS block — including its own icons.
 */
export const brandSetting = createToolbarSetting({
    storageKey: "dextinity-ui-brand",
    titles: {
        dextinity: "Dextinity",
        "ai-hub": "Dextinity AI Hub",
        cms: "Dextinity CMS",
        crimson: "Crimson (example)",
        nordwerk: "Nordwerk (example)",
        loden: "Loden (example)",
        aqualis: "Aqualis (example)",
    },
    defaultValue: "dextinity",
});
