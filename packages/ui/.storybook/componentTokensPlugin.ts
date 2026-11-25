import type { Plugin } from "vite";

import { componentTokensOf } from "./componentTokens";
import { metaNameOf, parseStoryFile } from "./storyFile";

/**
 * Adds `parameters.componentTokens` to the meta of each story file whose `meta.component` reads component tokens, for the token
 * table on its docs page.
 */
export function componentTokensPlugin(): Plugin {
    return {
        name: "dextinity-ui-component-tokens",
        enforce: "pre",
        transform(code, id) {
            if (!id.endsWith(".stories.tsx")) {
                return undefined;
            }
            const metaName = metaNameOf(parseStoryFile(code, id));
            const componentTokens = componentTokensOf(id);
            if (metaName === undefined || componentTokens === undefined) {
                return undefined;
            }
            for (const sourceFile of componentTokens.sourceFiles) {
                this.addWatchFile(sourceFile);
            }
            if (componentTokens.tokens.length === 0) {
                return undefined;
            }
            const parameters = `${metaName}.parameters`;
            return { code: `${code}\n${parameters} = { ...${parameters}, componentTokens: ${JSON.stringify(componentTokens.tokens)} };`, map: null };
        },
    };
}
