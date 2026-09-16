// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ContentScope {}

type InvalidContentScopeDimension = "A content scope dimension must be a string, a number, null or undefined";

/**
 * The scope of a single module, which uses the dimensions of the application's `ContentScope` or a subset of them.
 * A dimension of an unsupported type resolves to `InvalidContentScopeDimension`, so the application's scope class no
 * longer fits the module it is passed to.
 */
export type ModuleContentScope = {
    [Dimension in keyof ContentScope]?: ContentScope[Dimension] extends string | number | null | undefined
        ? ContentScope[Dimension]
        : InvalidContentScopeDimension;
};
