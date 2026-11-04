declare module "draft-js-export-markdown" {
    import type { ContentState } from "draft-js";

    const main: any;

    export type stateToMarkdown = (v: ContentState) => string;
    export const stateToMarkdown: stateToMarkdown;

    export default main;
}

declare module "draft-js-import-markdown" {
    import type { ContentState } from "draft-js";

    const main: any;
    export type stateFromMarkdown = (v: any) => ContentState;
    export const stateFromMarkdown: stateFromMarkdown;

    export default main;
}
