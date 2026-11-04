import { type PixelImageBlockConfig, useConfig } from "../../config/ConfigProvider.js";

/**
 * Reads `config.pixelImageBlock` from the configuration context and returns it narrowed to non-null.
 */
export function usePixelImageBlockConfig(): PixelImageBlockConfig {
    const { pixelImageBlock } = useConfig();

    if (!pixelImageBlock) {
        throw new Error("`pixelImageBlock` must be set in `config` on `MjmlMailRoot` or `ConfigProvider` to use the pixel-image configuration.");
    }

    return pixelImageBlock;
}
