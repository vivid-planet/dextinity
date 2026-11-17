import type { Config } from "@dextinity/mail-react";
import dextinityConfig from "@src/dextinity-config.json" with { type: "json" };

/** Builds the mail configuration every mail passes to its root, holding the values image blocks need to build their URLs. */
export function createMailConfig(siteUrl: string): Config {
    const validSizes = [...dextinityConfig.images.imageSizes, ...dextinityConfig.images.deviceSizes];

    return {
        pixelImageBlock: {
            validSizes,
            baseUrl: siteUrl,
        },
    };
}
