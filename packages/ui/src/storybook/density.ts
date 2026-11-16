import type { ThemeDensity } from "../theme/types";
import { createToolbarSetting } from "./toolbarSetting";

export const densitySetting = createToolbarSetting<ThemeDensity>({
    storageKey: "dextinity-ui-density",
    titles: {
        comfortable: "Comfortable",
        standard: "Standard",
        compact: "Compact",
    },
    defaultValue: "standard",
});
