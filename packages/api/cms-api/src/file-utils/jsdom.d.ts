// jsdom doesn't ship its own types and @types/jsdom pulls in the DOM lib globally
// (via `/// <reference lib="dom" />`), which clashes with Node's stream types used elsewhere
// in this package. Declare the minimal surface we actually use instead.
declare module "jsdom" {
    import type { WindowLike } from "dompurify";

    export class JSDOM {
        constructor(html?: string);
        readonly window: WindowLike;
    }
}
