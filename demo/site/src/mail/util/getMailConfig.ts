import type { Config } from "@dextinity/mail-react";
import dextinityConfig from "@src/dextinity-config.json" with { type: "json" };
import type { ContentScope } from "@src/site-configs";
import { getSiteConfigForDomain } from "@src/util/siteConfig";

/** Builds the mail configuration every mail passes to its root, holding the values image blocks need to build their URLs. */
export function getMailConfig(scope: ContentScope): Config {
    const validSizes = [...dextinityConfig.images.imageSizes, ...dextinityConfig.images.deviceSizes];

    return {
        pixelImageBlock: {
            validSizes,
            baseUrl: getSiteConfigForDomain(scope.domain).url,
        },
    };
}
