import noNextPublicEnv from "./rules/no-next-public-env.js";
import noOtherModuleRelativeImport from "./rules/no-other-module-relative-import.js";
import noPrivateSiblingImport from "./rules/no-private-sibling-import.js";

const plugin = {
    rules: {
        "no-private-sibling-import": noPrivateSiblingImport,
        "no-other-module-relative-import": noOtherModuleRelativeImport,
        "no-next-public-env": noNextPublicEnv,
    },
};
export type Plugin = typeof plugin;

export default plugin;
