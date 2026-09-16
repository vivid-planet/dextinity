/**
 * Declares the dimensions of the application's content scope, for instance `domain` and `language`.
 * An application augments this interface, every other type derives from it.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ContentScopeDimensions {}

type InvalidContentScopeDimension = "A content scope dimension must be a string, a number, null or undefined";

/**
 * A dimension of an unsupported type resolves to `InvalidContentScopeDimension`, so a scope carrying it no longer fits
 * where a content scope is expected.
 */
export type ContentScope = {
    [Dimension in keyof ContentScopeDimensions]: ContentScopeDimensions[Dimension] extends string | number | null | undefined
        ? ContentScopeDimensions[Dimension]
        : InvalidContentScopeDimension;
};

/**
 * The scope of a single module, which uses the dimensions of the content scope or a subset of them.
 */
export type ModuleContentScope = Partial<ContentScope>;
