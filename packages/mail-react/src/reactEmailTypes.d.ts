// This file must be a module (hence `export {}`) so the `declare module "react"`
// blocks augment React's types. Without it the file is a global script, and
// `declare module "react"` would declare a standalone module that replaces
// `@types/react` rather than merging into it — the interfaces below wouldn't apply.
export {};

declare module "react" {
    interface CSSProperties {
        /** Makes Outlook honor `line-height` exactly instead of auto-expanding it for tall content; pair it with every manual `line-height`. */
        msoLineHeightRule?: "exactly" | "at-least";
        /** Outlook applies cell padding through this instead of `padding`. */
        msoPaddingAlt?: string;
    }

    interface TdHTMLAttributes {
        /** Legacy background attribute Outlook honors when it ignores `background-color`. */
        bgcolor?: string;
    }
}
