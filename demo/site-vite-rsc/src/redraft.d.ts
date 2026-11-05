declare module "redraft" {
    import type { ReactElement, ReactNode } from "react";

    interface InlineStylesMap {
        [key: string]: (children: ReactNode, options: { key: string }) => ReactNode;
    }

    export type TextBlockRenderFn = (children: ReactNode[], options: { key: string; depth: number; keys: string[] }) => ReactNode;
    interface BlockMap {
        [key: string]: TextBlockRenderFn;
    }

    interface EntityMap {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        [key: string]: (children: ReactNode, data: any, options: { key: string }) => ReactNode;
    }

    export interface Renderers {
        inline?: InlineStylesMap;
        blocks?: BlockMap;
        entities?: EntityMap;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const redraft = (raw: any, renderers: Renderers): ReactElement<any, any> | null => {};

    export default redraft;
}
