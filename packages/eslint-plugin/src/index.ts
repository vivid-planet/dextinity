import noNextPublicEnv from "./rules/no-next-public-env";
import noOtherModuleRelativeImport from "./rules/no-other-module-relative-import";
import noPrivateSiblingImport from "./rules/no-private-sibling-import";

const plugin = {
    rules: {
        "no-private-sibling-import": noPrivateSiblingImport,
        "no-other-module-relative-import": noOtherModuleRelativeImport,
        "no-next-public-env": noNextPublicEnv,
    },
};
export type Plugin = typeof plugin;

module.exports = plugin;
