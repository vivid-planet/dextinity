import { createContext, type PropsWithChildren, type ReactNode, useContext } from "react";

export interface PixelImageBlockConfig {
    /**
     * Image widths supported by the API, used to pick a render width.
     * Generally derived from `dextinityConfig.images.imageSizes` and `dextinityConfig.images.deviceSizes`.
     */
    validSizes: number[];
    /**
     * Origin to prefix relative image URLs with, e.g. `http://localhost:3000`.
     */
    baseUrl: string;
}

/**
 * The image that `HtmlImage` or `MjmlImage` is about to render, as passed to `Config.resolveImageSrc`.
 */
export interface ResolveImageSrcOptions {
    src: string;
    width?: number | string;
    height?: number | string;
}

/**
 * Configuration context for mails.
 *
 * Add custom keys via TypeScript interface declaration merging:
 *
 * ```ts
 * declare module "@dextinity/mail-react" {
 *     interface Config {
 *         myKey?: { foo: string };
 *     }
 * }
 * ```
 */
export interface Config {
    /**
     * Configuration consumed by `HtmlPixelImageBlock` and `MjmlPixelImageBlock`.
     * Required when those components are rendered.
     */
    pixelImageBlock?: PixelImageBlockConfig;
    /**
     * Returns the `src` that `HtmlImage` and `MjmlImage` render for an image, e.g. a `cid:` reference to an
     * attachment of the sent mail. Also applies to `HtmlPixelImageBlock` and `MjmlPixelImageBlock`, which render
     * through them. Without it, an image is rendered with its own `src`.
     */
    resolveImageSrc?: (image: ResolveImageSrcOptions) => string;
}

const ConfigContext = createContext<Config>({});

/**
 * Places a `Config` value into a React context, making it available to all
 * descendants via `useConfig`.
 */
export function ConfigProvider({ config, children }: PropsWithChildren<{ config: Config }>): ReactNode {
    return <ConfigContext.Provider value={config}>{children}</ConfigContext.Provider>;
}

/**
 * Returns the nearest `Config` from context, defined by `ConfigProvider` or by the `config` prop on `MjmlMailRoot`.
 */
export function useConfig(): Config {
    return useContext(ConfigContext);
}
