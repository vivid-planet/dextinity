// redraft ships no type declarations (and no `@types/redraft` exists), so the
// parts of its API used by this package are declared here.
declare module "redraft" {
    import type { ReactNode } from "react";

    export type InlineRenderFn = (children: ReactNode, options: { key: string }) => ReactNode;
    export type TextBlockRenderFn = (children: ReactNode[], options: { key: string; depth: number; keys: string[] }) => ReactNode;
    export type EntityRenderFn = (children: ReactNode, data: unknown, options: { key: string }) => ReactNode;

    export interface Renderers {
        inline?: Record<string, InlineRenderFn>;
        blocks?: Record<string, TextBlockRenderFn>;
        entities?: Record<string, EntityRenderFn>;
    }

    export interface RedraftOptions {
        /** Renderer to fall back to for unknown draft block types. @defaultValue `"unstyled"` */
        blockFallback?: string;
    }

    type RenderRichText = (raw: unknown, renderers: Renderers, options?: RedraftOptions) => ReactNode;

    // redraft is CommonJS-only: under native ESM the default import is the whole
    // `module.exports` object, under bundlers it is the render function itself.
    const redraft: RenderRichText | { default: RenderRichText };
    export default redraft;
}
