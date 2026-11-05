"use client";
import { createContext, type PropsWithChildren, useContext } from "react";

export type ImageConfig = {
    /** Widths for images that span a large part of the viewport */
    deviceSizes: number[];
    /** Widths for smaller images, e.g. with a `sizes` like `33vw` */
    imageSizes: number[];
};

const ImageConfigContext = createContext<ImageConfig | undefined>(undefined);

/**
 * Sets the widths that images are requested in, the counterpart of `images` in `next.config.ts`.
 * They must match the widths the API allows (`images` of `dextinity-config.json`).
 *
 * @example
 * <ImageConfigProvider config={dextinityConfig.images}>{children}</ImageConfigProvider>
 */
export function ImageConfigProvider({ config, children }: PropsWithChildren<{ config: ImageConfig }>) {
    return <ImageConfigContext.Provider value={config}>{children}</ImageConfigContext.Provider>;
}

export function useImageConfig(): ImageConfig {
    const config = useContext(ImageConfigContext);
    if (!config) {
        throw new Error("Images need to know the widths the API allows, render an ImageConfigProvider in the root layout");
    }
    return config;
}
