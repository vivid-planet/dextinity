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
