import { generateImageUrl, parseAspectRatio } from "@dextinity/site-react";
// eslint-disable-next-line no-restricted-imports
import NextImageImport, { type ImageProps as NextImageProps } from "next/image";

// `next/image` is a CJS module; under Next.js Pages Router its default import
// from this ESM package yields the module-namespace object instead of the
// component (Node-style ESM↔CJS interop). Unwrap so the component works under
// both bundler-style and Node-style interop.
const NextImage: typeof NextImageImport = (NextImageImport as unknown as { default?: typeof NextImageImport }).default ?? NextImageImport;

type Props = Omit<NextImageProps, "loader"> & { aspectRatio: string };

export function Image({ aspectRatio, ...nextImageProps }: Props) {
    const usedAspectRatio = parseAspectRatio(aspectRatio);

    return <NextImage loader={(loaderProps) => generateImageUrl(loaderProps, usedAspectRatio)} {...nextImageProps} />;
}
