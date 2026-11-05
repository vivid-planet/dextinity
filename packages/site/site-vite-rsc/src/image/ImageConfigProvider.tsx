"use client";
import { createContext, type PropsWithChildren, useContext } from "react";

export type ImageConfig = {
    /** Widths for images spanning a large part of the viewport */
    deviceSizes: number[];
    /** Widths for smaller images */
    imageSizes: number[];
};

const ImageConfigContext = createContext<ImageConfig | undefined>(undefined);

/**
 * Sets the image widths, which must be the widths the API resizes images to (`images` of `dextinity-config.json`)
 */
export function ImageConfigProvider({ config, children }: PropsWithChildren<{ config: ImageConfig }>) {
    return <ImageConfigContext.Provider value={config}>{children}</ImageConfigContext.Provider>;
}

export function useImageConfig(): ImageConfig {
    const config = useContext(ImageConfigContext);
    if (!config) {
        throw new Error("Images need the widths the API resizes to, render an ImageConfigProvider in the root layout");
    }
    return config;
}
